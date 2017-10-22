pragma solidity ^0.4.15;

contract AccountRegistry {
  mapping(account => bool) accounts;
  mapping(account => Invite) invites;

  struct Invite {
    uint256 createdAt;
    address from;
    bool collateralized;
  }
}
