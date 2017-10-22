pragma solidity ^0.4.15;

import 'zeppelin/token/StandardToken.sol';

contract MockBLT is StandardToken {
  function MockBLT() {
    totalSupply = 1.5e26;
  }
}
