pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract MockBLT is StandardToken {
  event Gift(address recipient);

  function MockBLT() {
    totalSupply_ = 1.5e26;
  }

  function gift(address _recipient) {
    balances[_recipient] += 1e18;
    Gift(_recipient);
  }
}
