pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountRegistryInterface.sol";
import "./AccountRegistryLogic.sol";

contract AccountRegistryBatchAdmin is Ownable{

  AccountRegistryInterface public registry;
  AccountRegistryLogic public logic;
  address public registryAdmin;

  constructor(
    AccountRegistryInterface _registry,
    AccountRegistryLogic _logic
    ) public {
    registry = _registry;
    logic = _logic;
    registryAdmin = owner;
  }

  event addressSkipped(address skippedAddress);

  /**
   * @dev Restricted to registryAdmin
   */
  modifier onlyRegistryAdmin {
    require(msg.sender == registryAdmin);
    _;
  }

  /**
   * @notice Change the address of the registryAdmin, who has the privilege to create new accounts
   * @dev Restricted to AccountRegistry owner and new admin address cannot be 0x0
   * @param _newRegistryAdmin Address of new registryAdmin
   */
  function setRegistryAdmin(address _newRegistryAdmin) public onlyOwner {
    address _oldRegistryAdmin = registryAdmin;
    registryAdmin = _newRegistryAdmin;
  }

  /**
   * @notice Create an account instantly without an invitation
   * @dev Restricted to the "invite admin" which is managed by the Bloom team
   * @param _newUsers Address array of the users receiving an account
   */
  function batchCreateAccount(address[] _newUsers) public onlyRegistryAdmin {
    for (uint256 i = 0; i < _newUsers.length; i++) {
      if (registry.addressBelongsToAccount(_newUsers[i])) {
        emit addressSkipped(_newUsers[i]);
      } else {
        logic.createAccount(_newUsers[i]);
      }
    }
  }
}
