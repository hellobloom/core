pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract MockBLT is StandardToken {
  event Gift(address recipient);

  constructor() public {
    totalSupply_ = 1.5e26;
  }

  function gift(address _recipient, uint256 _amount) public {
    balances[_recipient] += _amount;
    emit Gift(_recipient);
  }
}
