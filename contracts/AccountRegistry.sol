pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountRegistryInterface.sol";

/**
 * @title Bloom account registry
 * @notice Account Registry implements the Bloom ID data structures 
 * and the low-level account administration functions.
 * The account administration functions are not publicly accessible.
 * Account Registry Logic implements the public functions which access the functions in Account Registry.
 */
contract AccountRegistry is Ownable, AccountRegistryInterface{

  address public accountRegistryLogic;

  /**
   * @notice The AccountRegistry constructor configures the account registry logic implementation
   *  and creates an account for the user who deployed the contract.
   * @dev The owner is also set as the original registryAdmin, who has the privilege to
   *  create accounts outside of the normal invitation flow.
   * @param _accountRegistryLogic Address of deployed Account Registry Logic implementation
   */
  constructor(
    address _accountRegistryLogic
    ) public {
    accountRegistryLogic = _accountRegistryLogic;
  }

  event AccountRegistryLogicChanged(address oldRegistryLogic, address newRegistryLogic);

  /**
   * @dev Zero address not allowed
   */
  modifier nonZero(address _address) {
    require(_address != 0);
    _;
  }

  modifier onlyAccountRegistryLogic() {
    require(msg.sender == accountRegistryLogic);
    _;
  }

  // Counter to generate unique account Ids
  uint256 numAccounts;
  mapping(address => uint256) public accountByAddress;

  /**
   * @notice Change the address of the registry logic which has exclusive write control over this contract
   * @dev Restricted to AccountRegistry owner and new admin address cannot be 0x0
   * @param _newRegistryLogic Address of new registry logic implementation
   */
  function setRegistryLogic(address _newRegistryLogic) public onlyOwner nonZero(_newRegistryLogic) {
    address _oldRegistryLogic = accountRegistryLogic;
    accountRegistryLogic = _newRegistryLogic;
    emit AccountRegistryLogicChanged(_oldRegistryLogic, accountRegistryLogic);
  }

  /**
   * @notice Retreive account ID associated with a user's address
   * @param _address Address to look up
   * @return account id as uint256 if exists, otherwise reverts
   */
  function accountIdForAddress(address _address) public view returns (uint256) {
    require(addressBelongsToAccount(_address));
    return accountByAddress[_address];
  }

  /**
   * @notice Check if an address is associated with any user account
   * @dev Check if address is associated with any user by cross validating
   *  the accountByAddress with addressByAccount 
   * @param _address Address to check
   * @return true if address has been assigned to user. otherwise reverts
   */
  function addressBelongsToAccount(address _address) public view returns (bool) {
    return accountByAddress[_address] > 0;
  }

  /**
   * @notice Create an account for a user and emit an event
   * @param _newUser Address of the new user
   */
  function createNewAccount(address _newUser) external onlyAccountRegistryLogic nonZero(_newUser) {
    require(!addressBelongsToAccount(_newUser));
    numAccounts++;
    accountByAddress[_newUser] = numAccounts;
  }

  /**
   * @notice Add an address to an existing id 
   * @param _newAddress Address to add to account
   * @param _sender User requesting this action
   */
  function addAddressToAccount(
    address _newAddress,
    address _sender
    ) external onlyAccountRegistryLogic nonZero(_newAddress) {

    // check if address belongs to someone else
    require(!addressBelongsToAccount(_newAddress));

    accountByAddress[_newAddress] = accountIdForAddress(_sender);
  }

  /**
   * @notice Remove an address from an id
   * @param _addressToRemove Address to remove from account
   */
  function removeAddressFromAccount(
    address _addressToRemove
    ) external onlyAccountRegistryLogic {
    delete accountByAddress[_addressToRemove];
  }
}