pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./SigningLogic.sol";

/**
 * @notice TokenEscrowMarketplace is an ERC20 payment channel that enables users to send BLT by exchanging signatures off-chain
 *  Users approve the contract address to transfer BLT on their behalf using the standard ERC20.approve function
 *  After approval, either the user or the contract admin initiates the transfer of BLT into the contract
 *  Once in the contract, users can send payments via a signed message to another user. 
 *  The signature transfers BLT from lockup to the recipient's balance
 *  Users can withdraw funds at any time. Or the admin can release them on the user's behalf
 *  
 *  BLT is stored in the contract by address
 *  
 *  Only the AttestationLogic contract is authorized to release funds once a jobs is complete
 */
contract TokenEscrowMarketplace is SigningLogic {
  using SafeERC20 for ERC20;
  using SafeMath for uint256;

  address public attestationLogic;

  mapping(address => uint256) public tokenEscrow;
  ERC20 public token;

  event TokenMarketplaceWithdrawal(address escrowPayer, uint256 amount);
  event TokenMarketplaceEscrowPayment(address escrowPayer, address escrowPayee, uint256 amount);
  event TokenMarketplaceDeposit(address escrowPayer, uint256 amount);

  /**
   * @notice The TokenEscrowMarketplace constructor initializes the interfaces to the other contracts
   * @dev Some actions are restricted to be performed by the attestationLogic contract.
   *  Signing logic is upgradeable in case the signTypedData spec changes
   * @param _token Address of BLT
   * @param _attestationLogic Address of current attestation logic contract
   */
  constructor(
    ERC20 _token,
    address _attestationLogic
    ) public SigningLogic("Bloom Token Escrow Marketplace", "2", 1) {
    token = _token;
    attestationLogic = _attestationLogic;
  }

  modifier onlyAttestationLogic() {
    require(msg.sender == attestationLogic);
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
   * @param _delegationSig Signed hash of these input parameters so an admin can submit this on behalf of a user
   */
  function moveTokensToEscrowLockupFor(
    address _sender,
    uint256 _amount,
    bytes32 _nonce,
    bytes calldata _delegationSig
    ) external {
      validateLockupTokensSig(
        _sender,
        _amount,
        _nonce,
        _delegationSig
      );
      moveTokensToEscrowLockupForUser(_sender, _amount);
  }

  /**
   * @notice Verify lockup signature is valid
   * @param _sender User locking up their tokens
   * @param _amount Tokens to lock up
   * @param _nonce Unique Id so signatures can't be replayed
   * @param _delegationSig Signed hash of these input parameters so an admin can submit this on behalf of a user
   */
  function validateLockupTokensSig(
    address _sender,
    uint256 _amount,
    bytes32 _nonce,
    bytes memory _delegationSig
  ) private {
    bytes32 _signatureDigest = generateLockupTokensDelegationSchemaHash(_sender, _amount, _nonce);
    require(_sender == recoverSigner(_signatureDigest, _delegationSig), 'Invalid LockupTokens Signature');
    burnSignatureDigest(_signatureDigest, _sender);
  }

  /**
   * @notice Lockup tokens by user. Must be preceeded by approve
   * @param _amount Tokens to lock up
   */
  function moveTokensToEscrowLockup(uint256 _amount) external {
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
    ) private {
    token.safeTransferFrom(_sender, address(this), _amount);
    addToEscrow(_sender, _amount);
  }

  /**
   * @notice Withdraw tokens from escrow back to requester
   * @dev Authorized by a signTypedData signature by sender
   *  Sigs can only be used once. They contain a unique nonce
   *  So an action can be repeated, with a different signature
   * @param _sender User withdrawing their tokens
   * @param _amount Tokens to withdraw
   * @param _nonce Unique Id so signatures can't be replayed
   * @param _delegationSig Signed hash of these input parameters so an admin can submit this on behalf of a user
   */
  function releaseTokensFromEscrowFor(
    address _sender,
    uint256 _amount,
    bytes32 _nonce,
    bytes calldata _delegationSig
    ) external {
      validateReleaseTokensSig(
        _sender,
        _amount,
        _nonce,
        _delegationSig
      );
      releaseTokensFromEscrowForUser(_sender, _amount);
  }

  /**
   * @notice Verify lockup signature is valid
   * @param _sender User withdrawing their tokens
   * @param _amount Tokens to lock up
   * @param _nonce Unique Id so signatures can't be replayed
   * @param _delegationSig Signed hash of these input parameters so an admin can submit this on behalf of a user
   */
  function validateReleaseTokensSig(
    address _sender,
    uint256 _amount,
    bytes32 _nonce,
    bytes memory _delegationSig

  ) private {
    bytes32 _signatureDigest = generateReleaseTokensDelegationSchemaHash(_sender, _amount, _nonce);
    require(_sender == recoverSigner(_signatureDigest, _delegationSig), 'Invalid ReleaseTokens Signature');
    burnSignatureDigest(_signatureDigest, _sender);
  }

  /**
   * @notice Release tokens back to payer's available balance if lockup expires
   * @dev Token balance retreived by accountId. Can be different address from the one that deposited tokens
   * @param _amount Tokens to retreive from escrow
   */
  function releaseTokensFromEscrow(uint256 _amount) external {
    releaseTokensFromEscrowForUser(msg.sender, _amount);
  }

  /**
   * @notice Release tokens back to payer's available balance
   * @param _payer User retreiving tokens from escrow
   * @param _amount Tokens to retreive from escrow
   */
  function releaseTokensFromEscrowForUser(
    address _payer,
    uint256 _amount
    ) private {
      subFromEscrow(_payer, _amount);
      token.safeTransfer(_payer, _amount);
      emit TokenMarketplaceWithdrawal(_payer, _amount);
  }

  /**
   * @notice Pay from escrow of payer to available balance of receiever
   * @dev Private function to modify balances on payment
   * @param _payer User with tokens in escrow
   * @param _receiver User receiving tokens
   * @param _amount Tokens being sent
   */
  function payTokensFromEscrow(address _payer, address _receiver, uint256 _amount) private {
    subFromEscrow(_payer, _amount);
    token.safeTransfer(_receiver, _amount);
  }

  /**
   * @notice Pay tokens to receiver from payer's escrow given a valid signature
   * @dev Execution restricted to attestationLogic contract
   * @param _payer User paying tokens from escrow
   * @param _receiver User receiving payment
   * @param _amount Tokens being paid
   * @param _nonce Unique Id for sig to make it one-time-use
   * @param _paymentSig Signed parameters by payer authorizing payment
   */
  function requestTokenPayment(
    address _payer,
    address _receiver,
    uint256 _amount,
    bytes32 _nonce,
    bytes calldata _paymentSig
    ) external onlyAttestationLogic {

    validatePaymentSig(
      _payer,
      _receiver,
      _amount,
      _nonce,
      _paymentSig
    );
    payTokensFromEscrow(_payer, _receiver, _amount);
    emit TokenMarketplaceEscrowPayment(_payer, _receiver, _amount);
  }

  /**
   * @notice Verify payment signature is valid
   * @param _payer User paying tokens from escrow
   * @param _receiver User receiving payment
   * @param _amount Tokens being paid
   * @param _nonce Unique Id for sig to make it one-time-use
   * @param _paymentSig Signed parameters by payer authorizing payment
   */
  function validatePaymentSig(
    address _payer,
    address _receiver,
    uint256 _amount,
    bytes32 _nonce,
    bytes memory _paymentSig

  ) private {
    bytes32 _signatureDigest = generatePayTokensSchemaHash(_payer, _receiver, _amount, _nonce);
    require(_payer == recoverSigner(_signatureDigest, _paymentSig), 'Invalid Payment Signature');
    burnSignatureDigest(_signatureDigest, _payer);
  }

  /**
   * @notice Helper function to add to escrow balance 
   * @param _from Account address for escrow mapping
   * @param _amount Tokens to lock up
   */
  function addToEscrow(address _from, uint256 _amount) private {
    tokenEscrow[_from] = tokenEscrow[_from].add(_amount);
    emit TokenMarketplaceDeposit(_from, _amount);
  }

  /**
   * Helper function to reduce escrow token balance of user
   */
  function subFromEscrow(address _from, uint256 _amount) private {
    require(tokenEscrow[_from] >= _amount);
    tokenEscrow[_from] = tokenEscrow[_from].sub(_amount);
  }
}
