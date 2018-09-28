pragma solidity 0.4.24;

contract SigningLogicInterface {
  function recoverSigner(bytes32 _hash, bytes _sig) external pure returns (address);
  function generateRequestAttestationSchemaHash(
    address _subject,
    address _attester,
    address _requester,
    bytes32 _dataHash,
    uint256[] _typeIds,
    bytes32 _nonce
    ) external view returns (bytes32);
  function generateAttestForDelegationSchemaHash(
    address _subject,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
    uint256[] _typeIds,
    bytes32 _requestNonce
    ) external view returns (bytes32);
  function generateContestForDelegationSchemaHash(
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce
  ) external view returns (bytes32);
  function generateStakeForDelegationSchemaHash(
    address _subject,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
    uint256[] _typeIds,
    bytes32 _requestNonce,
    uint256 _stakeDuration
    ) external view returns (bytes32);
  function generateRevokeStakeForDelegationSchemaHash(
    uint256 _subjectId,
    uint256 _attestationId
    ) external view returns (bytes32);
  function generateAddAddressSchemaHash(
    address _senderAddress,
    bytes32 _nonce
    ) external view returns (bytes32);
  function generateVoteForDelegationSchemaHash(
    uint16 _choice,
    address _voter,
    bytes32 _nonce,
    address _poll
    ) external view returns (bytes32);
  function generateReleaseTokensSchemaHash(
    address _sender,
    address _receiver,
    uint256 _amount,
    bytes32 _uuid
    ) external view returns (bytes32);
  function generateLockupTokensDelegationSchemaHash(
    address _sender,
    uint256 _amount,
    bytes32 _nonce
    ) external view returns (bytes32);
}