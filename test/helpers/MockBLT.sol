pragma solidity ^0.4.15;

import 'zeppelin/token/StandardToken.sol';

contract MockBLT is StandardToken {
  function MockBLT() {
    totalSupply = 1.5e26;
  }

  function gift(address _recipient) {
    balances[_recipient] += 1e18;
  }
}
