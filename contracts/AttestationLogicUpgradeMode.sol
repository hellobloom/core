pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountRegistryInterface.sol";
import "./AttestationRepoInterface.sol";

/**
 * @title AttestationLogicUpgradeMode is designed to have temporary control over AttestationRepo
 *  so the admin can repopulate attestations to an upgraded contract
 * @dev 
 */
contract AttestationLogicUpgradeMode is Ownable{
  AccountRegistryInterface public registry;
  AttestationRepoInterface public attestationRepo;

  /**
   * @notice AttestationLogic constructor sets the implementation address of all related contracts
   * @param _registry Address of deployed AccountRegistry implementation
   * @param _attestationRepo Address of deployed attestation repo
   */
  constructor(
    AccountRegistryInterface _registry,
    AttestationRepoInterface _attestationRepo
  ) public {
    attestationRepo = _attestationRepo;
    registry = _registry;
  }

  struct Attestation {
    uint256 attesterId;
    uint256 completedAt;
    uint256 stakeValue;
    uint256 expiresAt;
  }

  event TraitAttested(
    uint256 attestationId,
    uint256 subjectId,
    uint256 attesterId,
    uint256 requesterId,
    bytes32 dataHash,
    uint256[] typeIds,
    uint256 stakeValue,
    uint256 expiresAt
    );

  /**
   * @notice Write attestation on behalf of subject and attester by Bloom admin
   *  Only allowed during specified contract upgrade period
   * @param _subject User whose data is being confirmed by attester
   * @param _attester User who is confirming subject's data
   * @param _requester User who is requesting the attestation be completed
   * @param _dataHash Hash of data and nonce for this attestation
   * @param _typeIds array of trait type ids to validate
   * @param _timestamp Timestamp when this attestation was completed
   */
  function proxyWriteAttestation(
    address _subject,
    address _attester,
    address _requester,
    bytes32 _dataHash,
    uint256[] _typeIds,
    uint256 _timestamp
  ) public onlyOwner {
    uint256 _requesterId = registry.accountIdForAddress(_requester);
    uint256 _attesterId = registry.accountIdForAddress(_attester);
    uint256 _subjectId = registry.accountIdForAddress(_subject);

    uint256 _attestationId = attestationRepo.writeAttestation(
      _subjectId,
      _attesterId,
      _timestamp,
      0,
      0
    );

    emit TraitAttested(
      _attestationId,
      _subjectId,
      _attesterId,
      _requesterId,
      _dataHash,
      _typeIds,
      0,
      0
    );
  }
}
