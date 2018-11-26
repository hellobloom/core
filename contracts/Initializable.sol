pragma solidity 0.4.24;

/**
 * @title Initializable
 * @dev The Initializable contract has an initializer address, and provides basic authorization control
 * only while in initialization mode. Once changed to production mode the inializer loses authority
 */
contract Initializable {
  address public initializer;
  bool public initializing;

  event InitializationEnded();

  /**
   * @dev The Initializable constructor sets the initializer to the provided address
   */
  constructor(address _initializer) public {
    initializer = _initializer;
    initializing = true;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyDuringInitialization() {
    require(msg.sender == initializer, 'Method can only be called by initializer');
    require(initializing, 'Method can only be called during initialization');
    _;
  }

  /**
   * @dev Allows the initializer to end the initialization period
   */
  function endInitialization() public onlyDuringInitialization {
    initializing = false;
    emit InitializationEnded();
  }

}
