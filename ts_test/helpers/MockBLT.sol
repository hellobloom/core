pragma solidity ^0.4.15;

import 'zeppelin/token/StandardToken.sol';

contract MockBLT is StandardToken {
  event Gift(address recipient);

  function MockBLT() {
    totalSupply = 1.5e26;
  }

  function gift(address _recipient) {
    balances[_recipient] += 1e18;
    Gift(_recipient);
  }
}
