pragma solidity 0.4.18;

import "zeppelin/ownership/Ownable.sol";
import "zeppelin/token/SafeERC20.sol";
import "zeppelin/token/ERC20.sol";
import "./InviteCollateralizer.sol";
import "./ECRecovery.sol";

/**
 * @title Bloom account registry
 *
 * This contract handles user accounts within Bloom. The "invite admin" is the
 * only user which can automatically make an account for someone and this is reserved
 * for the Bloom team to create accounts for early adopters and to make the onboarding
 * experience a bit easier. Users can invite others if they use the inviteCollateralizer
 * to lock up a small amount of BLT.
 *
 * In order to invite someone, a user must generate a new public key private key pair
 * and sign their own ethereum address. The user provides this signature to the
 * `createInvite` function where the public key is recovered and the invite is created.
 * The inviter should then share the one-time-use private key out of band with the recipient.
 * The recipient accepts the invite by signing their own address and passing that signature
 * to the `acceptInvite` function. The contract should recover the same public key, demonstrating
 * that the recipient knows the secret and is likely the person intended to receive the invite.
 *
 * @dev This invite model is supposed to aid usability by not requiring the inviting user to know
 *   the Ethereum address of the recipient. If the one-time-use private key is leaked then anyone
 *   else can accept the invite. This is an intentional tradeoff of this invite system. A well built
 *   dApp should generate the private key on the backend and sign the user's address for them. Likewise,
 *   the signing should also happen on the backend (not visible to the user) for signing an address to
 *   accept an invite. This reduces the private key exposure so that the dApp can still require traditional
 *   checks like verifying an associated email address before finally signing the user's Ethereum address.
 *
 * @dev The private key generated for this invite system should NEVER be used for an Ethereum address.
 *   The private key should be used only for the invite flow and then it should effectively be discarded.
 *
 * @dev If a user DOES know the address of the person they are inviting then they can still use this
 *   invite system. All they have to do then is sign the address of the user being invited and share the
 *   signature with them.
 */
contract AccountRegistry is Ownable {
  mapping(address => bool) public accounts;

  // Inviter + recipient pair
  struct Invite {
    address creator;
    address recipient;
  }

  // Mapping of public keys as Ethereum addresses to invite information
  // NOTE: the address keys here are NOT Ethereum addresses, we just happen
  // to work with the public keys in terms of Ethereum address strings because
  // this is what `ecrecover` produces when working with signed text.
  mapping(address => Invite) public invites;

  InviteCollateralizer public inviteCollateralizer;
  ERC20 public blt;
  address private inviteAdmin;

  event InviteCreated(address indexed inviter);
  event InviteAccepted(address indexed inviter, address indexed recipient);
  event AccountCreated(address indexed newUser);

  function AccountRegistry(ERC20 _blt, InviteCollateralizer _inviteCollateralizer) public {
    blt = _blt;
    accounts[owner] = true;
    inviteAdmin = owner;
    inviteCollateralizer = _inviteCollateralizer;
  }

  function setInviteCollateralizer(InviteCollateralizer _newInviteCollateralizer) public nonZero(_newInviteCollateralizer) onlyOwner {
    inviteCollateralizer = _newInviteCollateralizer;
  }

  function setInviteAdmin(address _newInviteAdmin) public onlyOwner nonZero(_newInviteAdmin) {
    inviteAdmin = _newInviteAdmin;
  }

  /**
   * @dev Create an account instantly. Reserved for the "invite admin" which is managed by the Bloom team
   * @param _newUser Address of the user receiving an account
   */
  function createAccount(address _newUser) public onlyInviteAdmin {
    require(!accounts[_newUser]);
    createAccountFor(_newUser);
  }

  /**
   * @dev Create an invite using the signing model described in the contract description
   * @param _sig Signature for `msg.sender`
   */
  function createInvite(bytes _sig) public onlyUser {
    require(inviteCollateralizer.takeCollateral(msg.sender));

    address signer = recoverSigner(_sig);
    require(inviteDoesNotExist(signer));

    invites[signer] = Invite(msg.sender, address(0));
    InviteCreated(msg.sender);
  }

  /**
   * @dev Accept an invite using the signing model described in the contract description
   * @param _sig Signature for `msg.sender` via the same key that issued the initial invite
   */
  function acceptInvite(bytes _sig) public onlyNonUser {
    address signer = recoverSigner(_sig);
    require(inviteExists(signer) && inviteHasNotBeenAccepted(signer));

    invites[signer].recipient = msg.sender;
    createAccountFor(msg.sender);
    InviteAccepted(invites[signer].creator, msg.sender);
  }

  /**
   * @dev Recover the address associated with the public key that signed the provided signature
   * @param _sig Signature of `msg.sender`
   */
  function recoverSigner(bytes _sig) private view returns (address) {
    address signer = ECRecovery.recover(keccak256(msg.sender), _sig);
    require(signer != address(0));

    return signer;
  }

  /**
   * @dev Create an account and emit an event
   * @param _newUser Address of the new user
   */
  function createAccountFor(address _newUser) private {
    accounts[_newUser] = true;
    AccountCreated(_newUser);
  }

  /**
   * @dev Check if an invite has not been set on the struct meaning it hasn't been accepted
   */
  function inviteHasNotBeenAccepted(address _signer) internal view returns (bool) {
    return invites[_signer].recipient == address(0);
  }

  /**
   * @dev Check that an invite hasn't already been created with this signer
   */
  function inviteDoesNotExist(address _signer) internal view returns (bool) {
    return !inviteExists(_signer);
  }

  /**
   * @dev Check that an invite has already been created with this signer
   */
  function inviteExists(address _signer) internal view returns (bool) {
    return invites[_signer].creator != address(0);
  }

  /**
   * @dev Addresses with Bloom accounts already are not allowed
   */
  modifier onlyNonUser {
    require(!accounts[msg.sender]);
    _;
  }

  /**
   * @dev Addresses without Bloom accounts already are not allowed
   */
  modifier onlyUser {
    require(accounts[msg.sender]);
    _;
  }

  modifier nonZero(address _address) {
    require(_address != 0);
    _;
  }

  modifier onlyInviteAdmin {
    require(msg.sender == inviteAdmin);
    _;
  }
}
