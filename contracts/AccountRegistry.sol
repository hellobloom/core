pragma solidity ^0.4.15;

import "zeppelin/ownership/Ownable.sol";
import "zeppelin/token/SafeERC20.sol";
import "zeppelin/token/ERC20.sol";
import "./InviteCollateralizer.sol";
import "./ECRecovery.sol";

contract AccountRegistry is Ownable {
  mapping(address => bool) public accounts;

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

  function AccountRegistry(ERC20 _blt, InviteCollateralizer _inviteCollateralizer) {
    blt = _blt;
    accounts[owner] = true;
    inviteAdmin = owner;
    inviteCollateralizer = _inviteCollateralizer;
  }

  function setInviteCollateralizer(InviteCollateralizer _newInviteCollateralizer) nonZero(_newInviteCollateralizer) onlyOwner {
    inviteCollateralizer = _newInviteCollateralizer;
  }

  function setInviteAdmin(address _newInviteAdmin) onlyOwner nonZero(_newInviteAdmin) {
    inviteAdmin = _newInviteAdmin;
  }

  function createAccount(address _newUser) onlyInviteAdmin {
    require(!accounts[_newUser]);
    createAccountFor(_newUser);
  }

  function createInvite(bytes _sig) onlyUser {
    require(inviteCollateralizer.takeCollateral(msg.sender));

    address signer = recoverSigner(_sig);
    require(inviteDoesNotExist(signer));

    invites[signer] = Invite(msg.sender, address(0));
    InviteCreated(msg.sender);
  }

  function acceptInvite(bytes _sig) onlyNonUser {
    address signer = recoverSigner(_sig);
    require(inviteExists(signer) && inviteHasNotBeenAccepted(signer));

    invites[signer].recipient = msg.sender;
    createAccountFor(msg.sender);
    InviteAccepted(invites[signer].creator, msg.sender);
  }

  function recoverSigner(bytes _sig) private returns (address) {
    address signer = ECRecovery.recover(keccak256(msg.sender), _sig);
    require(signer != address(0));

    return signer;
  }

  function createAccountFor(address _newUser) private {
    accounts[_newUser] = true;
    AccountCreated(_newUser);
  }

  function inviteHasNotBeenAccepted(address _signer) internal returns (bool) {
    return invites[_signer].recipient == address(0);
  }

  function inviteDoesNotExist(address _signer) internal returns (bool) {
    return !inviteExists(_signer);
  }

  function inviteExists(address _signer) internal returns (bool) {
    return invites[_signer].creator != address(0);
  }

  modifier onlyNonUser {
    require(!accounts[msg.sender]);
    _;
  }

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
