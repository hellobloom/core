pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./AttestationRepoInterface.sol";

/**
 * @title AttestationRepo stores attestations for the Bloom protocol
 * @notice Attestation Repo implements the data structures to store attestations
 *  and the low-level read/ write functions. The functions are not publicly accessible.
 *  Attestation Logic implements the public functions which access the functions in Attestation Repo.
 */
contract AttestationRepo is Ownable, Pausable, AttestationRepoInterface{
  using SafeERC20 for ERC20;
  ERC20 public token;
  address public attestationLogic;

  /**
   * @notice AttestationRepo constructor sets the implementation address of AttestationLogic and AccountRegistry
   * @param _attestationLogic Address of deployed AttestationLogic implementation
   */
  constructor(
    ERC20 _token,
    address _attestationLogic
    ) public {
    token = _token;
    attestationLogic = _attestationLogic;
  }

  // Map BloomId to array of attestations
  mapping(uint256 => Attestation[]) public attestations;

  struct Attestation {
    uint256 attesterId;
    uint256 completedAt;
    uint256 stakeValue;
    uint256 expiresAt;
  }

  event AttestationLogicChanged(address oldAttestationLogic, address newAttestationLogic);

  modifier onlyAttestationLogic() {
    require(msg.sender == attestationLogic);
    _;
  }

  /**
   * @dev Zero address not allowed
   */
  modifier nonZero(address _address) {
    require(_address != 0);
    _;
  }

  /**
   * @notice Change the address of Attestion Logic which has write control over attestations
   * @dev Restricted to AttestationRepo owner and new address cannot be 0x0
   * @param _newAttestationLogic Address of new Attestation Logic contract
   */
  function setAttestationLogic(address _newAttestationLogic) external onlyOwner nonZero(_newAttestationLogic) {
    address oldAttestationLogic = attestationLogic;
    attestationLogic = _newAttestationLogic;
    emit AttestationLogicChanged(oldAttestationLogic, attestationLogic);
  }

  /**
   * @notice Write a new attestation to the repo
   * @dev Access restricted to attestationLogic contract
   * @param _subjectId User whose data is being confirmed by attester
   * @param _attesterId User who is confirming subject's data
   * @param _timestamp Timestamp when this attestation was completed
   * @param _stakeValue BLT amount for this stake
   * @param _expiresAt Time when this stake expires and tokens can be released
   * @return AttestationId
   */
  function writeAttestation(
    uint256 _subjectId,
    uint256 _attesterId,
    uint256 _timestamp,
    uint256 _stakeValue,
    uint256 _expiresAt
    ) external onlyAttestationLogic returns (uint256) {

    uint256 _attestationId = attestations[_subjectId].push(
      Attestation(
        _attesterId,
        _timestamp,
        _stakeValue,
        _expiresAt
      )
    ) - 1;

    return _attestationId;
  }

  /**
   * @notice Looks up attestationRequest by subject and request Ids
   * @dev Gets pointer to attestationRequest struct and returns fields individually
   * @param _subjectId User who is the subject of the attestation
   * @param _attestationId identifier for specific attestation 
   * @return each field of an attestation
   */
  function readAttestation(uint256 _subjectId, uint256 _attestationId) external view returns (
    uint256 _attesterId,
    uint256 _completedAt,
    uint256 _stakeValue,
    uint256 _expiresAt
  ) {
    // _request is pointer to specific attestation request in storage
    Attestation storage _attestation = attestations[_subjectId][_attestationId];
    _attesterId = _attestation.attesterId;
    _completedAt = _attestation.completedAt;
    _stakeValue = _attestation.stakeValue;
    _expiresAt = _attestation.expiresAt;
  }

  /**
   * @notice Nullifies the fields of an attestation
   * @dev Leaves a hole in the attestations array
   * @param _subjectId User who is the subject of the attestation
   * @param _attestationId identifier for specific attestation 
   */
  function revokeAttestation(uint256 _subjectId, uint256 _attestationId) external onlyAttestationLogic {
    delete attestations[_subjectId][_attestationId];
  }

  /**
   * @notice Update stake fields on an existing attestation
   * @dev Access restricted to attestationLogic contract
   * @param _subjectId User whose data is being confirmed by attester
   * @param _attestationId Attestation this stake is referencing
   * @param _stakeValue BLT amount for this stake
   * @param _expiresAt Time when this stake expires and tokens can be released
   */
  function writeStake(
    uint256 _subjectId,
    uint256 _attestationId,
    uint256 _stakeValue,
    uint256 _expiresAt
    ) external onlyAttestationLogic {
    Attestation storage _attestation  = attestations[_subjectId][_attestationId];
    _attestation.stakeValue = _stakeValue;
    _attestation.expiresAt = _expiresAt;
  }

  function transferTokensToStaker(
    address _staker,
    uint256 _value
    ) external onlyAttestationLogic whenNotPaused {
    token.safeTransfer(_staker, _value);
  }
}