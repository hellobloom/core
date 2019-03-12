pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AttestationLogic.sol";
import "./TokenEscrowMarketplace.sol";
import "./Initializable.sol";

contract BatchInitializer is Ownable{

  AttestationLogic public attestationLogic;
  address public admin;

  constructor(
    AttestationLogic _attestationLogic
    ) public {
    attestationLogic = _attestationLogic;
    admin = owner;
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
   * @dev Restricted to BatchInitializer owner and new admin address cannot be 0x0
   * @param _newAdmin Address of new admin
   */
  function setAdmin(address _newAdmin) external onlyOwner {
    admin = _newAdmin;
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

  function batchMigrateAttestations(
    address[] _requesters,
    address[] _attesters,
    address[] _subjects,
    bytes32[] _dataHashes
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