pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract MockBLT is ERC20 {
  event Gift(address recipient);

  constructor() public {
  }

  function gift(address _recipient, uint256 _amount) public {
    ERC20._mint(_recipient, _amount);
    emit Gift(_recipient);
  }
}
