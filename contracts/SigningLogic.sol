pragma solidity 0.4.24;

import "./ECRecovery.sol";
import "./SigningLogicInterface.sol";

/**
 * @title SigningLogic is an upgradeable contract implementing signature recovery from typed data signatures
 * @notice Recovers signatures based on the SignTypedData implementation provided by Metamask
 * @dev This contract is deployed separately and is referenced by other contracts.
 *  The other contracts have functions that allow this contract to be swapped out
 *  They will continue to work as long as this contract implements at least the functions in SigningLogicInterface
 */
contract SigningLogic is SigningLogicInterface{

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );

  bytes32 constant ATTESTATION_REQUEST_TYPEHASH = keccak256(
    "AttestationRequest(address subject,address attester,address requester,bytes32 dataHash,bytes32 typeHash,bytes32 nonce)"
  );

  bytes32 constant ADD_ADDRESS_TYPEHASH = keccak256(
    "AddAddress(address sender,bytes32 nonce)"
  );

  bytes32 constant RELEASE_TOKENS_TYPEHASH = keccak256(
    "ReleaseTokens(address sender,address receiver,uint256 amount,bytes32 nonce)"
  );

  bytes32 constant ATTEST_FOR_TYPEHASH = keccak256(
    "AttestFor(address subject,address requester,uint256 reward,bytes32 paymentNonce,bytes32 dataHash,bytes32 typeHash,bytes32 requestNonce)"
  );

  bytes32 constant CONTEST_FOR_TYPEHASH = keccak256(
    "ContestFor(address requester,uint256 reward,bytes32 paymentNonce)"
  );

  bytes32 constant STAKE_FOR_TYPEHASH = keccak256(
    "StakeFor(address subject,uint256 value,bytes32 paymentNonce,bytes32 dataHash,bytes32 typeHash,bytes32 requestNonce,uint256 stakeDuration)"
  );

  bytes32 constant REVOKE_STAKE_FOR_TYPEHASH = keccak256(
    "RevokeStakeFor(uint256 subjectId,uint256 attestationId)"
  );

  bytes32 constant VOTE_FOR_TYPEHASH = keccak256(
    "VoteFor(uint16 choice,address voter,bytes32 nonce,address poll)"
  );

  bytes32 constant LOCKUP_TOKENS_FOR = keccak256(
    "LockupTokensFor(address sender,uint256 amount,bytes32 nonce)"
  );

  bytes32 DOMAIN_SEPARATOR;

  constructor () public {
    DOMAIN_SEPARATOR = hash(EIP712Domain({
      name: "Bloom",
      version: '1',
      chainId: 4,
      // verifyingContract: this
      verifyingContract: 0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC
    }));
  }

  struct EIP712Domain {
      string  name;
      string  version;
      uint256 chainId;
      address verifyingContract;
  }

  function hash(EIP712Domain eip712Domain) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256(bytes(eip712Domain.name)),
      keccak256(bytes(eip712Domain.version)),
      eip712Domain.chainId,
      eip712Domain.verifyingContract
    ));
  }

  struct AttestationRequest {
      address subject;
      address attester;
      address requester;
      bytes32 dataHash;
      bytes32 typeHash;
      bytes32 nonce;
  }

  function hash(AttestationRequest request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      ATTESTATION_REQUEST_TYPEHASH,
      request.subject,
      request.attester,
      request.requester,
      request.dataHash,
      request.typeHash,
      request.nonce
    ));
  }

  struct AddAddress {
      address sender;
      bytes32 nonce;
  }

  function hash(AddAddress request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      ADD_ADDRESS_TYPEHASH,
      request.sender,
      request.nonce
    ));
  }

  struct ReleaseTokens {
      address sender;
      address receiver;
      uint256 amount;
      bytes32 nonce;
  }

  function hash(ReleaseTokens request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      RELEASE_TOKENS_TYPEHASH,
      request.sender,
      request.receiver,
      request.amount,
      request.nonce
    ));
  }

  struct AttestFor {
      address subject;
      address requester;
      uint256 reward;
      bytes32 paymentNonce;
      bytes32 dataHash;
      bytes32 typeHash;
      bytes32 requestNonce;
  }

  function hash(AttestFor request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      ATTEST_FOR_TYPEHASH,
      request.subject,
      request.requester,
      request.reward,
      request.paymentNonce,
      request.dataHash,
      request.typeHash,
      request.requestNonce
    ));
  }

  struct ContestFor {
      address requester;
      uint256 reward;
      bytes32 paymentNonce;
  }

  function hash(ContestFor request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      CONTEST_FOR_TYPEHASH,
      request.requester,
      request.reward,
      request.paymentNonce
    ));
  }

  struct StakeFor {
      address subject;
      uint256 value;
      bytes32 paymentNonce;
      bytes32 dataHash;
      bytes32 typeHash;
      bytes32 requestNonce;
      uint256 stakeDuration;
  }

  function hash(StakeFor request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      STAKE_FOR_TYPEHASH,
      request.subject,
      request.value,
      request.paymentNonce,
      request.dataHash,
      request.typeHash,
      request.requestNonce,
      request.stakeDuration
    ));
  }

  struct RevokeStakeFor {
      uint256 subjectId;
      uint256 attestationId;
  }

  function hash(RevokeStakeFor request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      REVOKE_STAKE_FOR_TYPEHASH,
      request.subjectId,
      request.attestationId
    ));
  }

  struct VoteFor {
      uint16 choice;
      address voter;
      bytes32 nonce;
      address poll;
  }

  function hash(VoteFor request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      VOTE_FOR_TYPEHASH,
      request.choice,
      request.voter,
      request.nonce,
      request.poll
    ));
  }

  struct LockupTokensFor {
    address sender;
    uint256 amount;
    bytes32 nonce;
  }

  function hash(LockupTokensFor request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      LOCKUP_TOKENS_FOR,
      request.sender,
      request.amount,
      request.nonce
    ));
  }

  function generateRequestAttestationSchemaHash(
    address _subject,
    address _attester,
    address _requester,
    bytes32 _dataHash,
    uint256[] _typeIds,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(AttestationRequest(
          _subject,
          _attester,
          _requester,
          _dataHash,
          keccak256(abi.encodePacked(_typeIds)),
          _nonce
        ))
      )
      );
  }

  function generateAddAddressSchemaHash(
    address _senderAddress,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(AddAddress(
          _senderAddress,
          _nonce
        ))
      )
      );
  }

  function generateReleaseTokensSchemaHash(
    address _sender,
    address _receiver,
    uint256 _amount,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(ReleaseTokens(
          _sender,
          _receiver,
          _amount,
          _nonce
        ))
      )
      );
  }

  function generateAttestForDelegationSchemaHash(
    address _subject,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
    uint256[] _typeIds,
    bytes32 _requestNonce
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(AttestFor(
          _subject,
          _requester,
          _reward,
          _paymentNonce,
          _dataHash,
          keccak256(abi.encodePacked(_typeIds)),
          _requestNonce
        ))
      )
      );
  }

  function generateContestForDelegationSchemaHash(
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(ContestFor(
          _requester,
          _reward,
          _paymentNonce
        ))
      )
      );
  }

  function generateStakeForDelegationSchemaHash(
    address _subject,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
    uint256[] _typeIds,
    bytes32 _requestNonce,
    uint256 _stakeDuration
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(StakeFor(
          _subject,
          _value,
          _paymentNonce,
          _dataHash,
          keccak256(abi.encodePacked(_typeIds)),
          _requestNonce,
          _stakeDuration
        ))
      )
      );
  }

  function generateRevokeStakeForDelegationSchemaHash(
    uint256 _subjectId,
    uint256 _attestationId
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(RevokeStakeFor(
          _subjectId,
          _attestationId
        ))
      )
      );
  }

  function generateVoteForDelegationSchemaHash(
    uint16 _choice,
    address _voter,
    bytes32 _nonce,
    address _poll
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(VoteFor(
          _choice,
          _voter,
          _nonce,
          _poll
        ))
      )
      );
  }

  function generateLockupTokensDelegationSchemaHash(
    address _sender,
    uint256 _amount,
    bytes32 _nonce
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(LockupTokensFor(
          _sender,
          _amount,
          _nonce
        ))
      )
      );
  }

  function recoverSigner(bytes32 _hash, bytes _sig) external pure returns (address) {
    address signer = ECRecovery.recover(_hash, _sig);
    require(signer != address(0));

    return signer;
  }
}
