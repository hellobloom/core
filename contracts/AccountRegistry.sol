pragma solidity ^0.4.15;

import "zeppelin/ownership/Ownable.sol";
import "zeppelin/token/SafeERC20.sol";
import "./BLT.sol";

contract AccountRegistry is Ownable {
  mapping(address => bool) public accounts;
  mapping(address => bool) public invites;
  mapping(address => mapping(address => bool)) pendingInvites;
  address public inviteCollateralizer;
  BLT public blt;

  function AccountRegistry(BLT _blt) {
    inviteCollateralizer = new InviteCollateralizer(this, _blt);
    blt = _blt;
    accounts[owner] = true;
  }

  function invite(address _recipient) {
    require(accounts[msg.sender] && !invites[_recipient]);
    require(InviteCollateralizer(inviteCollateralizer).takeCollateral(msg.sender));
    invites[_recipient] = true;
  }

  function acceptInvite() {
    require(invites[msg.sender]);

    invites[msg.sender] = false;
    accounts[msg.sender] = true;
  }
}

contract InviteCollateralizer is Ownable {
  using SafeERC20 for BLT;
  AccountRegistry public registry;
  BLT public blt;

  function InviteCollateralizer(AccountRegistry _registry, BLT _blt) {
    registry = _registry;
    blt = _blt;
  }

  function takeCollateral(address _owner) returns (bool) {
    return blt.transferFrom(_owner, address(this), 1);
  }
}
