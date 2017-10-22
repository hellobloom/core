pragma solidity ^0.4.15;

import "zeppelin/ownership/Ownable.sol";
import "./BLT.sol";

contract AccountRegistry is Ownable {
  mapping(address => bool) accounts;
  mapping(address => address) invites;
  mapping(address => mapping(address => bool)) pendingInvites;
  address public inviteCollateralizer;
  BLT public blt;

  function AccountRegistry(BLT _blt) {
    inviteCollateralizer = new InviteCollateralizer(this, _blt);
    blt = _blt;
  }

  function createAccount() {
    require(invites[msg.sender] != address(0) && !accounts[msg.sender]);
  }

  function invite(address _recipient) {
    pendingInvites[msg.sender][_recipient] = true;
  }
}

contract InviteCollateralizer is Ownable {
  AccountRegistry public registry;
  BLT public blt;

  function InviteCollateralizer(AccountRegistry _registry, BLT _blt) {
    registry = _registry;
    blt = _blt;
  }
}
