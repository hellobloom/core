pragma solidity ^0.4.15;

import "zeppelin/ownership/Ownable.sol";
import "zeppelin/token/SafeERC20.sol";
import "zeppelin/token/ERC20.sol";
import "./InviteCollateralizer.sol";

contract AccountRegistry is Ownable {
  mapping(address => bool) public accounts;
  
  // Inviter address -> hashed inviter secret -> boolean
  mapping(address => mapping(bytes32 => bool)) public inviterSecretDigests;
  
  // Invitee address -> hashed invitee secret -> block number
  mapping(address => mapping(bytes32 => uint256)) public inviteeSecretDigests;
  
  address public inviteCollateralizer;
  ERC20 public blt;
  address private inviteAdmin;

  event InviteCreated(address indexed inviter);
  event InviteAccepted(address indexed inviter, address indexed recipient);
  event AccountCreated(address indexed newUser);

  function AccountRegistry(ERC20 _blt, address _seizedTokensWallet) {
    inviteCollateralizer = new InviteCollateralizer(_blt, _seizedTokensWallet);
    blt = _blt;
    accounts[owner] = true;
    inviteAdmin = owner;
  }

  function setInviteAdmin(address _newInviteAdmin) onlyOwner nonZero(_newInviteAdmin) {
    inviteAdmin = _newInviteAdmin;
  }

  function createAccount(address _newUser) onlyInviteAdmin {
    require(!accounts[_newUser]);
    createAccountFor(_newUser);
  }

  function createInvite(bytes32 _hashedInviteSecret) onlyUser {
    require(InviteCollateralizer(inviteCollateralizer).takeCollateral(msg.sender));
    inviterSecretDigests[msg.sender][_hashedInviteSecret] = true;
    InviteCreated(msg.sender);
  }

  function beginAcceptInvite(bytes32 _hashedInviteeSecret) onlyNonUser {
    inviteeSecretDigests[msg.sender][_hashedInviteeSecret] = block.number;
  }

  function finishAcceptInvite(address _inviter, string _secret) onlyNonUser {
    bytes32 actualInviterSecret = inviteSecretDigest(_secret, _inviter);

    // Assert this secret was actually issued by this user
    require(inviterSecretDigests[_inviter][actualInviterSecret]);

    bytes32 actualInviteeSecret = inviteSecretDigest(_secret, msg.sender);

    // Assert this user has already demonstrated they know the secret
    require(block.number >= inviteeSecretDigests[msg.sender][actualInviteeSecret] + 5);

    inviterSecretDigests[_inviter][actualInviterSecret] = false;
    inviteeSecretDigests[msg.sender][actualInviteeSecret] = 0;
    createAccountFor(msg.sender);

    InviteAccepted(_inviter, msg.sender);
  }

  function createAccountFor(address _newUser) private {
    accounts[_newUser] = true;
    AccountCreated(_newUser);
  }

  function inviteSecretDigest(string _secret, address _subject) private returns (bytes32) {
    return keccak256(_secret, "/", _subject);
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
