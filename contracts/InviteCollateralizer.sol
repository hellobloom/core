pragma solidity ^0.4.15;

import "zeppelin/ownership/Ownable.sol";
import "zeppelin/token/SafeERC20.sol";
import "zeppelin/token/ERC20.sol";
import "./AccountRegistry.sol";

contract InviteCollateralizer is Ownable {
  using SafeERC20 for ERC20;
  AccountRegistry public registry;
  ERC20 public blt;

  function InviteCollateralizer(AccountRegistry _registry, ERC20 _blt) {
    registry = _registry;
    blt = _blt;
  }

  function takeCollateral(address _owner) returns (bool) {
    return blt.transferFrom(_owner, address(this), 1);
  }
}
