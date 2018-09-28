pragma solidity 0.4.24;

import "./AccountRegistryInterface.sol";

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./SigningLogicInterface.sol";

/**
 * @notice TokenEscrowMarketplace is an ERC20 payment channel that enables users to send BLT by exchanging signatures off-chain
 *  Users approve the contract address to transfer BLT on their behalf using the standard ERC20.approve function
 *  After approval, either the user or the contract admin initiates the transfer of BLT into the contract
 *  Once in the contract, users can send payments via a signed message to another user. 
 *  The signature transfers BLT from lockup to the recipient's balance
 *  Users can withdraw funds at any time. Or the admin can release them on the user's behalf
 *  
 *  BLT is stored in the contract by accountId. The accountIds are managed by Bloom's AccountRegistry contract
 *  
 *  Only the AttestationLogic contract is authorized to release funds once a jobs is complete
 */
contract TokenEscrowMarketplace is Ownable, Pausable{
  using SafeERC20 for ERC20;
  using SafeMath for uint256;

  AccountRegistryInterface public registry;
  SigningLogicInterface public signingLogic;
  address public attestationLogic;
  address public marketplaceAdmin;

  // Mapping of hashed signatures to bool. Sigs can only be used once
  mapping (bytes32 => bool) public usedSignatures;

  mapping(uint256 => uint256) public tokenEscrow;
  ERC20 public token;

  event TokenMarketplaceWithdrawal(uint256 subject, uint256 amount);
  event TokenMarketplaceEscrowPayment(uint256 escrowPayer, address escrowPayee, uint256 amount);
  event TokenMarketplaceDeposit(uint256 escrowPayer, uint256 amount);
  event SigningLogicChanged(address oldSigningLogic, address newSigningLogic);
  event AttestationLogicChanged(address oldAttestationLogic, address newAttestationLogic);
  event AccountRegistryChanged(address oldRegistry, address newRegistry);
  event MarketplaceAdminChanged(address oldMarketplaceAdmin, address newMarketplaceAdmin);

  /**
   * @notice The TokenEscrowMarketplace constructor initializes the interfaces to the other contracts
   * @dev Some actions are restricted to be performed by the attestationLogic contract.
   *  Signing logic is upgradeable in case the signTypedData spec changes
   *  AccountRegistry and Token are not modifiable because it could lead to lost funds
   * @param _token Address of BLT
   * @param _registry Address of AccountRegistry
   * @param _signingLogic Address of SigningLogic
   * @param _attestationLogic Address of current attestation logic contract
   */
  constructor(
    ERC20 _token,
    AccountRegistryInterface _registry,
    SigningLogicInterface _signingLogic,
    address _attestationLogic
    ) public {
    token = _token;
    registry = _registry;
    signingLogic = _signingLogic;
    attestationLogic = _attestationLogic;
    marketplaceAdmin = owner;
  }

  /**
   * @notice Change the marketplace admin
   * @dev Restricted to owner and new address cannot be 0x0
   * @param _newMarketplaceAdmin Address of new marketplace admin
   */
  function setMarketplaceAdmin(address _newMarketplaceAdmin) external onlyOwner nonZero(_newMarketplaceAdmin) {
    address oldMarketplaceAdmin = marketplaceAdmin;
    marketplaceAdmin = _newMarketplaceAdmin;
    emit MarketplaceAdminChanged(oldMarketplaceAdmin, marketplaceAdmin);
  }

  /**
   * @notice Change the implementation of the SigningLogic contract by setting a new address
   * @dev Restricted to owner and new implementation address cannot be 0x0
   * @param _newSigningLogic Address of new SigningLogic implementation
   */
  function setSigningLogic(SigningLogicInterface _newSigningLogic) 
    external nonZero(_newSigningLogic) onlyOwner whenPaused {
    address oldSigningLogic = signingLogic;
    signingLogic = _newSigningLogic;
    emit SigningLogicChanged(oldSigningLogic, signingLogic);
  }

  /**
   * @notice Change the address of Attestion Logic which has write control over attestations
   * @dev Restricted to owner and new address cannot be 0x0
   * @param _newAttestationLogic Address of new Attestation Logic contract
   */
  function setAttestationLogic(address _newAttestationLogic)
    external onlyOwner nonZero(_newAttestationLogic) whenPaused {
    address oldAttestationLogic = attestationLogic;
    attestationLogic = _newAttestationLogic;
    emit AttestationLogicChanged(oldAttestationLogic, attestationLogic);
  }

  /**
   * @notice Change the address of AccountRegistry in case something really bad happens
   * @dev Restricted to owner and new address cannot be 0x0
   * @param _newRegistry Address of new Account Registry contract
   */
  function setAccountRegistry(AccountRegistryInterface _newRegistry) 
    external onlyOwner nonZero(_newRegistry) whenPaused {
    address oldRegistry = registry;
    registry = _newRegistry;
    emit AccountRegistryChanged(oldRegistry, registry);
  }

  /**
   * @dev Zero address not allowed
   */
  modifier nonZero(address _address) {
    require(_address != 0);
    _;
  }

  modifier onlyAttestationLogic() {
    require(msg.sender == attestationLogic);
    _;
  }

  modifier onlyMarketplaceAdmin() {
    require(msg.sender == marketplaceAdmin);
    _;
  }

  /**
   * @notice Lockup tokens for set time period on behalf of user. Must be preceeded by approve
   * @dev Authorized by a signTypedData signature by sender
   *  Sigs can only be used once. They contain a unique nonce
   *  So an action can be repeated, with a different signature
   * @param _sender User locking up their tokens
   * @param _amount Tokens to lock up
   * @param _nonce Unique Id so signatures can't be replayed
   * @param _delegationSig Signed hash of these input parameters so admin can submit this on behalf of a user
   */
  function moveTokensToEscrowLockupFor(
    address _sender,
    uint256 _amount,
    bytes32 _nonce,
    bytes _delegationSig
    ) public onlyMarketplaceAdmin {
    require(!usedSignatures[keccak256(_delegationSig)], "Signature not unique");
    usedSignatures[keccak256(_delegationSig)] = true;
    bytes32 _delegationDigest = signingLogic.generateLockupTokensDelegationSchemaHash(
      _sender,
      _amount,
      _nonce
    );
    require(_sender == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
    moveTokensToEscrowLockupForUser(_sender, _amount);
  }

  /**
   * @notice Lockup tokens by user. Must be preceeded by approve
   * @param _amount Tokens to lock up
   */
  function moveTokensToEscrowLockup(uint256 _amount) public {
    moveTokensToEscrowLockupForUser(msg.sender, _amount);
  }

  /**
   * @notice Lockup tokens for set time. Must be preceeded by approve
   * @dev Private function called by appropriate public function
   * @param _sender User locking up their tokens
   * @param _amount Tokens to lock up
   */
  function moveTokensToEscrowLockupForUser(
    address _sender,
    uint256 _amount
    ) private whenNotPaused {
    uint256 _payerId = registry.accountIdForAddress(_sender);
    token.safeTransferFrom(_sender, this, _amount);
    addToEscrow(_payerId, _amount);
  }

  /**
   * @notice Release tokens back to payer's available balance if lockup expires
   * @dev Token balance retreived by accountId. Can be different address from the one that deposited tokens
   * @param _amount Tokens to retreive from escrow
   */
  function releaseTokensFromEscrow(uint256 _amount) public {
    releaseTokensFromEscrowForUser(msg.sender, _amount);
  }

  /**
   * @notice Release tokens back to payer's available balance if lockup expires
   * @dev Token balance retreived by accountId. Can be different address from the one that deposited tokens
   * @param _payer User retreiving tokens from escrow
   * @param _amount Tokens to retreive from escrow
   */
  function releaseTokensFromEscrowFor(address _payer, uint256 _amount) public onlyMarketplaceAdmin{
    releaseTokensFromEscrowForUser(_payer, _amount);
  }

  /**
   * @notice Release tokens back to payer's available balance if lockup expires
   * @dev Token balance retreived by accountId. Can be different address from the one that deposited tokens
   * @param _payer User retreiving tokens from escrow
   * @param _amount Tokens to retreive from escrow
   */
  function releaseTokensFromEscrowForUser(
    address _payer,
    uint256 _amount
    ) private whenNotPaused {
    uint256 _payerId = registry.accountIdForAddress(_payer);
    subFromEscrow(_payerId, _amount);
    token.safeTransfer(_payer, _amount);
    emit TokenMarketplaceWithdrawal(_payerId, _amount);
  }

  /**
   * @notice Pay from escrow of payer to available balance of receiever
   * @dev Private function to modify balances on payment
   * @param _payerId User with tokens in escrow
   * @param _receiver User receiving tokens
   * @param _amount Tokens being sent
   */
  function payTokensFromEscrow(uint256 _payerId, address _receiver, uint256 _amount) private {
    subFromEscrow(_payerId, _amount);
    token.safeTransfer(_receiver, _amount);
  }

  /**
   * @notice Release tokens to receiver from payer's escrow given a valid signature
   * @dev Execution restricted to attestationLogic contract
   * @param _payer User paying tokens from escrow
   * @param _receiver User receiving payment
   * @param _amount Tokens being paid
   * @param _nonce Unique Id for sig to make it one-time-use
   * @param _releaseSig Signed parameters by payer authorizing payment
   */
  function requestTokenPayment(
    address _payer,
    address _receiver,
    uint256 _amount,
    bytes32 _nonce,
    bytes _releaseSig
    ) external onlyAttestationLogic whenNotPaused {
    uint256 _payerId = registry.accountIdForAddress(_payer);

    require(!usedSignatures[keccak256(_releaseSig)], "Signature not unique");
    usedSignatures[keccak256(_releaseSig)] = true;

    bytes32 _digest = signingLogic.generateReleaseTokensSchemaHash(
      _payer,
      _receiver,
      _amount,
      _nonce
    );
    address signer = signingLogic.recoverSigner(_digest, _releaseSig);
    require(_payer == signer, "Invalid signer");

    payTokensFromEscrow(_payerId, _receiver, _amount);
    emit TokenMarketplaceEscrowPayment(_payerId, _receiver, _amount);
  }

  /**
   * @notice Helper function to add to escrow balance and set releaseDate
   * @dev Must be later than current release date
   * @param _from Account Id for escrow mapping
   * @param _amount Tokens to lock up
   */
  function addToEscrow(uint256 _from, uint256 _amount) private {
    tokenEscrow[_from] = tokenEscrow[_from].add(_amount);
    emit TokenMarketplaceDeposit(_from, _amount);
  }

  /**
   * Helper function to reduce escrow token balance of user
   */
  function subFromEscrow(uint256 _from, uint256 _amount) private {
    require(tokenEscrow[_from] >= _amount);
    tokenEscrow[_from] = tokenEscrow[_from].sub(_amount);
  }
}
