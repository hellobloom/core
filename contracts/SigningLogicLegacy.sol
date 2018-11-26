pragma solidity 0.4.24;

import "./ECRecovery.sol";

/**
 * @title SigningLogic is an upgradeable contract implementing signature recovery from typed data signatures
 * @notice Recovers signatures based on the SignTypedData implementation provided by Metamask
 * @dev This contract is deployed separately and is referenced by other contracts.
 *  The other contracts have functions that allow this contract to be swapped out
 *  They will continue to work as long as this contract implements at least the functions in SigningLogicInterface
 */
contract SigningLogicLegacy {

  bytes32 constant ATTESTATION_REQUEST_TYPEHASH = keccak256(
      abi.encodePacked(
        "bytes32 dataHash",
        "bytes32 nonce"
      )
  );

  bytes32 constant ADD_ADDRESS_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address addressToAdd",
        "bytes32 nonce"
      )
  );

  bytes32 constant REMOVE_ADDRESS_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address addressToRemove",
        "bytes32 nonce"
      )
  );

  bytes32 constant RELEASE_TOKENS_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address sender",
        "address receiver",
        "uint256 amount",
        "bytes32 nonce"
      )
  );

  bytes32 constant ATTEST_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address subject",
        "address requester",
        "uint256 reward", 
        "bytes32 paymentNonce",
        "bytes32 dataHash",
        "bytes32 requestNonce"
      )
  );

  bytes32 constant CONTEST_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address requester",
        "uint256 reward", 
        "bytes32 paymentNonce"
      )
  );

  bytes32 constant STAKE_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address subject",
        "uint256 value", 
        "bytes32 paymentNonce",
        "bytes32 dataHash",
        "bytes32 requestNonce",
        "uint256 stakeDuration"
      )
  );

  bytes32 constant REVOKE_STAKE_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "uint256 subjectId",
        "uint256 attestationId"
      )
  );

  bytes32 constant REVOKE_ATTESTATION_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "bytes32 link"
      )
  );

  bytes32 constant VOTE_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "uint16 choice",
        "address voter",
        "bytes32 nonce",
        "address poll"
      )
  );

  bytes32 constant LOCKUP_TOKENS_FOR_TYPEHASH = keccak256(
      abi.encodePacked(
        "string action",
        "address sender",
        "uint256 amount",
        "bytes32 nonce"
      )
  );

  struct AttestationRequest {
      bytes32 dataHash;
      bytes32 nonce;
  }

  function hash(AttestationRequest request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        ATTESTATION_REQUEST_TYPEHASH,
        keccak256(
          abi.encodePacked(
            request.dataHash,
            request.nonce
          )
        )
    ));
  }

  struct AddAddress {
      address addressToAdd;
      bytes32 nonce;
  }

  function hash(AddAddress request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        ADD_ADDRESS_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "addAddress",
            request.addressToAdd,
            request.nonce
          )
        )
    ));
  }

  struct RemoveAddress {
      address addressToRemove;
      bytes32 nonce;
  }

  function hash(RemoveAddress request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        REMOVE_ADDRESS_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "removeAddress",
            request.addressToRemove,
            request.nonce
          )
        )
    ));
  }

  struct ReleaseTokens {
      address sender;
      address receiver;
      uint256 amount;
      bytes32 nonce;
  }

  function hash(ReleaseTokens request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        RELEASE_TOKENS_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "pay",
            request.sender,
            request.receiver,
            request.amount,
            request.nonce
          )
        )
    ));
  }

  struct AttestFor {
      address subject;
      address requester;
      uint256 reward;
      bytes32 paymentNonce;
      bytes32 dataHash;
      bytes32 requestNonce;
  }

  function hash(AttestFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        ATTEST_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "attest",
            request.subject,
            request.requester,
            request.reward,
            request.paymentNonce,
            request.dataHash,
            request.requestNonce
          )
        )
    ));
  }

  struct ContestFor {
      address requester;
      uint256 reward;
      bytes32 paymentNonce;
  }

  function hash(ContestFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        CONTEST_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "contest",
            request.requester,
            request.reward,
            request.paymentNonce
          )
        )
    ));
  }

  struct StakeFor {
      address subject;
      uint256 value;
      bytes32 paymentNonce;
      bytes32 dataHash;
      bytes32 requestNonce;
      uint256 stakeDuration;
  }

  function hash(StakeFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        STAKE_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "stake",
            request.subject,
            request.value,
            request.paymentNonce,
            request.dataHash,
            request.requestNonce,
            request.stakeDuration
          )
        )
    ));
  }

  struct RevokeAttestationFor {
      bytes32 link;
  }

  function hash(RevokeAttestationFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        REVOKE_ATTESTATION_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "revokeAttestation",
            request.link
          )
        )
    ));
  }

  struct RevokeStakeFor {
      uint256 subjectId;
      uint256 attestationId;
  }

  function hash(RevokeStakeFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        REVOKE_STAKE_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "revokeStake",
            request.subjectId,
            request.attestationId
          )
        )
    ));
  }

  struct VoteFor {
      uint16 choice;
      address voter;
      bytes32 nonce;
      address poll;
  }

  function hash(VoteFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        VOTE_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            request.choice,
            request.voter,
            request.nonce,
            request.poll
          )
        )
    ));
  }

  struct LockupTokensFor {
    address sender;
    uint256 amount;
    bytes32 nonce;
  }

  function hash(LockupTokensFor request) internal pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        LOCKUP_TOKENS_FOR_TYPEHASH,
        keccak256(
          abi.encodePacked(
            "lockup",
            request.sender,
            request.amount,
            request.nonce
          )
        )
    ));
  }

  function generateRequestAttestationSchemaHash(
    bytes32 _dataHash,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return hash(
      AttestationRequest(
        _dataHash,
        _nonce
      )
    );
  }

  function generateAddAddressSchemaHash(
    address _addressToAdd,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return hash(
      AddAddress(
        _addressToAdd,
        _nonce
      )
    );
  }
  function generateRemoveAddressSchemaHash(
    address _addressToRemove,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return hash(
      RemoveAddress(
        _addressToRemove,
        _nonce
      )
    );
  }

  function generateReleaseTokensSchemaHash(
    address _sender,
    address _receiver,
    uint256 _amount,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return hash(
      ReleaseTokens(
        _sender,
        _receiver,
        _amount,
        _nonce
      )
    );
  }

  function generateAttestForDelegationSchemaHash(
    address _subject,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
    bytes32 _requestNonce
  ) external view returns (bytes32) {
    return hash(
      AttestFor(
        _subject,
        _requester,
        _reward,
        _paymentNonce,
        _dataHash,
        _requestNonce
      )
    );
  }

  function generateContestForDelegationSchemaHash(
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce
  ) external view returns (bytes32) {
    return hash(
      ContestFor(
        _requester,
        _reward,
        _paymentNonce
      )
    );
  }

  function generateStakeForDelegationSchemaHash(
    address _subject,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    uint256 _stakeDuration
  ) external view returns (bytes32) {
    return hash(
      StakeFor(
        _subject,
        _value,
        _paymentNonce,
        _dataHash,
        _requestNonce,
        _stakeDuration
      )
    );
  }

  function generateRevokeStakeForDelegationSchemaHash(
    uint256 _subjectId,
    uint256 _attestationId
  ) external view returns (bytes32) {
    return hash(
      RevokeStakeFor(
        _subjectId,
        _attestationId
      )
    );
  }

  function generateRevokeAttestationForDelegationSchemaHash(
    bytes32 _link
  ) external view returns (bytes32) {
    return hash(
      RevokeAttestationFor(
        _link
      )
    );
  }

  function generateVoteForDelegationSchemaHash(
    uint16 _choice,
    address _voter,
    bytes32 _nonce,
    address _poll
  ) external view returns (bytes32) {
    return hash(
      VoteFor(
        _choice,
        _voter,
        _nonce,
        _poll
      )
    );
  }

  function generateLockupTokensDelegationSchemaHash(
    address _sender,
    uint256 _amount,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return hash(
      LockupTokensFor(
        _sender,
        _amount,
        _nonce
      )
    );
  }

  function recoverSigner(bytes32 _hash, bytes _sig) external pure returns (address) {
    address signer = ECRecovery.recover(_hash, _sig);
    require(signer != address(0));

    return signer;
  }
}
