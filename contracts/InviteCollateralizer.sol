pragma solidity ^0.4.15;

import "zeppelin/ownership/Ownable.sol";
import "zeppelin/token/SafeERC20.sol";
import "zeppelin/token/ERC20.sol";
import "./AccountRegistry.sol";

contract InviteCollateralizer is Ownable {
  using SafeERC20 for ERC20;
  ERC20 public blt;

  mapping (address => Collateralization) public collateralizations;

  event ErrorMsg(string msg);
  event DebugMsg(string msg);

  struct Collateralization {
    uint64 releaseDate; // Date BLT can be withdrawn
    uint256 value; // Amount of BLT
  }

  event CollateralPosted(address indexed owner, uint64 releaseDate, uint256 amount);

  function InviteCollateralizer(ERC20 _blt) {
    blt = _blt;
  }

  function takeCollateral(address _owner) returns (bool) {
    DebugMsg("Trying to take collateral");

    // return blt.transferFrom(_owner, address(this), 1);
    if (!blt.transferFrom(_owner, address(this), 1)) {
      ErrorMsg("Failed to transfer from owner to collateralizer");
      revert();
    } else {
      DebugMsg("Transfered from owner");
    }

    uint64 releaseDate = uint64(now) + 1 years;
    CollateralPosted(_owner, releaseDate, 1);
    collateralizations[_owner] = Collateralization(releaseDate, 1);

    return true;
  }

  function reclaim() returns (bool) {
    return blt.transfer(msg.sender, 1);
  }
}
