pragma solidity 0.4.24;

contract AttestationRepoInterface {
  function writeAttestation(
    uint256 _subjectId,
    uint256 _attesterId,
    uint256 _timestamp,
    uint256 _stakeValue,
    uint256 _expiresAt
    ) external returns (uint256);
  function setAttestationLogic(address _newAttestationLogic) external;
  function readAttestation(uint256 _subjectId, uint256 _attestationId) external view returns (
    uint256 _attesterId,
    uint256 _completedAt,
    uint256 _stakeValue,
    uint256 _expiresAt
  );
  function revokeAttestation(uint256 _subjectId, uint256 _attestationId) external;
  function writeStake(
    uint256 _subjectId,
    uint256 _attestationId,
    uint256 _stakeValue,
    uint256 _expiresAt
    ) external;
  function transferTokensToStaker(
    address _staker,
    uint256 _value
  ) external;
}