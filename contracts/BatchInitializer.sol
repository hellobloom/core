pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountRegistryLogic.sol";
import "./AttestationLogic.sol";
import "./TokenEscrowMarketplace.sol";
import "./Initializable.sol";

contract BatchInitializer is Ownable{

  AccountRegistryLogic public registryLogic;
  AttestationLogic public attestationLogic;
  address public admin;

  constructor(
    AttestationLogic _attestationLogic,
    AccountRegistryLogic _registryLogic
    ) public {
    attestationLogic = _attestationLogic;
    registryLogic = _registryLogic;
    admin = msg.sender;
  }

  event linkSkipped(address currentAddress, address newAddress);

  /**
   * @dev Restricted to admin
   */
  modifier onlyAdmin {
    require(msg.sender == admin);
    _;
  }

  /**
   * @notice Change the address of the admin, who has the privilege to create new accounts
   * @dev Restricted to AccountRegistry owner and new admin address cannot be 0x0
   * @param _newAdmin Address of new admin
   */
  function setAdmin(address _newAdmin) external onlyOwner {
    admin = _newAdmin;
  }

  function setRegistryLogic(AccountRegistryLogic _newRegistryLogic) external onlyOwner {
    registryLogic = _newRegistryLogic;
  }

  function setAttestationLogic(AttestationLogic _newAttestationLogic) external onlyOwner {
    attestationLogic = _newAttestationLogic;
  }

  function setTokenEscrowMarketplace(TokenEscrowMarketplace _newMarketplace) external onlyOwner {
    attestationLogic.setTokenEscrowMarketplace(_newMarketplace);
  }

  function endInitialization(Initializable _initializable) external onlyOwner {
    _initializable.endInitialization();
  }

  function batchLinkAddresses(address[] calldata _currentAddresses, address[] calldata _newAddresses) external onlyAdmin {
    require(_currentAddresses.length == _newAddresses.length);
    for (uint256 i = 0; i < _currentAddresses.length; i++) {
      if (registryLogic.linkIds(_newAddresses[i]) > 0) {
        emit linkSkipped(_currentAddresses[i], _newAddresses[i]);
      } else {
        registryLogic.migrateLink(_currentAddresses[i], _newAddresses[i]);
      }
    }
  }

  function batchMigrateAttestations(
    address[] calldata _requesters,
    address[] calldata _attesters,
    address[] calldata _subjects,
    bytes32[] calldata _dataHashes
    ) external onlyAdmin {
    require(
      _requesters.length == _attesters.length &&
      _requesters.length == _subjects.length &&
      _requesters.length == _dataHashes.length
      );
    // This loop will fail if args don't all have equal length
    for (uint256 i = 0; i < _requesters.length; i++) {
      attestationLogic.migrateAttestation(
        _requesters[i],
        _attesters[i],
        _subjects[i],
        _dataHashes[i]
        );
    }
  }
}