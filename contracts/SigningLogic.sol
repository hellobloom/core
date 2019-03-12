pragma solidity 0.4.24;

import "./ECRecovery.sol";

/**
 * @title SigningLogic is contract implementing signature recovery from typed data signatures
 * @notice Recovers signatures based on the SignTypedData implementation provided by ethSigUtil
 * @dev This contract is inherited by other contracts.
 */
contract SigningLogic {

  // Signatures contain a nonce to make them unique. usedSignatures tracks which signatures
  //  have been used so they can't be replayed
  mapping (bytes32 => bool) public usedSignatures;

  function burnSignatureDigest(bytes32 _signatureDigest, address _sender) internal {
    bytes32 _txDataHash = keccak256(abi.encode(_signatureDigest, _sender));
    require(!usedSignatures[_txDataHash], "Signature not unique");
    usedSignatures[_txDataHash] = true;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );

  bytes32 constant ATTESTATION_REQUEST_TYPEHASH = keccak256(
    "AttestationRequest(bytes32 dataHash,bytes32 nonce)"
  );

  bytes32 constant PAY_TOKENS_TYPEHASH = keccak256(
    "PayTokens(address sender,address receiver,uint256 amount,bytes32 nonce)"
  );

  bytes32 constant RELEASE_TOKENS_FOR_TYPEHASH = keccak256(
    "ReleaseTokensFor(address sender,uint256 amount,bytes32 nonce)"
  );

  bytes32 constant ATTEST_FOR_TYPEHASH = keccak256(
    "AttestFor(address subject,address requester,uint256 reward,bytes32 dataHash,bytes32 requestNonce)"
  );

  bytes32 constant CONTEST_FOR_TYPEHASH = keccak256(
    "ContestFor(address requester,uint256 reward,bytes32 requestNonce)"
  );

  bytes32 constant REVOKE_ATTESTATION_FOR_TYPEHASH = keccak256(
    "RevokeAttestationFor(bytes32 link,bytes32 nonce)"
  );

  bytes32 constant VOTE_FOR_TYPEHASH = keccak256(
    "VoteFor(uint16 choice,address voter,bytes32 nonce,address poll)"
  );

  bytes32 constant LOCKUP_TOKENS_FOR_TYPEHASH = keccak256(
    "LockupTokensFor(address sender,uint256 amount,bytes32 nonce)"
  );

  bytes32 DOMAIN_SEPARATOR;

  constructor (string name, string version, uint256 chainId) public {
    DOMAIN_SEPARATOR = hash(EIP712Domain({
      name: name,
      version: version,
      chainId: chainId,
      verifyingContract: this
    }));
  }

  struct EIP712Domain {
      string  name;
      string  version;
      uint256 chainId;
      address verifyingContract;
  }

  function hash(EIP712Domain eip712Domain) private pure returns (bytes32) {
    return keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256(bytes(eip712Domain.name)),
      keccak256(bytes(eip712Domain.version)),
      eip712Domain.chainId,
      eip712Domain.verifyingContract
    ));
  }

  struct AttestationRequest {
      bytes32 dataHash;
      bytes32 nonce;
  }

  function hash(AttestationRequest request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      ATTESTATION_REQUEST_TYPEHASH,
      request.dataHash,
      request.nonce
    ));
  }

  struct PayTokens {
      address sender;
      address receiver;
      uint256 amount;
      bytes32 nonce;
  }

  function hash(PayTokens request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      PAY_TOKENS_TYPEHASH,
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
      bytes32 dataHash;
      bytes32 requestNonce;
  }

  function hash(AttestFor request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      ATTEST_FOR_TYPEHASH,
      request.subject,
      request.requester,
      request.reward,
      request.dataHash,
      request.requestNonce
    ));
  }

  struct ContestFor {
      address requester;
      uint256 reward;
      bytes32 requestNonce;
  }

  function hash(ContestFor request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      CONTEST_FOR_TYPEHASH,
      request.requester,
      request.reward,
      request.requestNonce
    ));
  }

  struct RevokeAttestationFor {
      bytes32 link;
      bytes32 nonce;
  }

  function hash(RevokeAttestationFor request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      REVOKE_ATTESTATION_FOR_TYPEHASH,
      request.link,
      request.nonce
    ));
  }

  struct VoteFor {
      uint16 choice;
      address voter;
      bytes32 nonce;
      address poll;
  }

  function hash(VoteFor request) private pure returns (bytes32) {
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

  function hash(LockupTokensFor request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      LOCKUP_TOKENS_FOR_TYPEHASH,
      request.sender,
      request.amount,
      request.nonce
    ));
  }

  struct ReleaseTokensFor {
    address sender;
    uint256 amount;
    bytes32 nonce;
  }

  function hash(ReleaseTokensFor request) private pure returns (bytes32) {
    return keccak256(abi.encode(
      RELEASE_TOKENS_FOR_TYPEHASH,
      request.sender,
      request.amount,
      request.nonce
    ));
  }

  function generateRequestAttestationSchemaHash(
    bytes32 _dataHash,
    bytes32 _nonce
  ) internal view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(AttestationRequest(
          _dataHash,
          _nonce
        ))
      )
      );
  }

  function generatePayTokensSchemaHash(
    address _sender,
    address _receiver,
    uint256 _amount,
    bytes32 _nonce
  ) internal view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(PayTokens(
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
    bytes32 _dataHash,
    bytes32 _requestNonce
  ) internal view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(AttestFor(
          _subject,
          _requester,
          _reward,
          _dataHash,
          _requestNonce
        ))
      )
      );
  }

  function generateContestForDelegationSchemaHash(
    address _requester,
    uint256 _reward,
    bytes32 _requestNonce
  ) internal view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(ContestFor(
          _requester,
          _reward,
          _requestNonce
        ))
      )
      );
  }

  function generateRevokeAttestationForDelegationSchemaHash(
    bytes32 _link,
    bytes32 _nonce
  ) internal view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(RevokeAttestationFor(
          _link,
          _nonce
        ))
      )
      );
  }

  function generateVoteForDelegationSchemaHash(
    uint16 _choice,
    address _voter,
    bytes32 _nonce,
    address _poll
  ) internal view returns (bytes32) {
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
  ) internal view returns (bytes32) {
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

  function generateReleaseTokensDelegationSchemaHash(
    address _sender,
    uint256 _amount,
    bytes32 _nonce
  ) internal view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,
        hash(ReleaseTokensFor(
          _sender,
          _amount,
          _nonce
        ))
      )
      );
  }

  function recoverSigner(bytes32 _hash, bytes _sig) internal pure returns (address) {
    address signer = ECRecovery.recover(_hash, _sig);
    require(signer != address(0));

    return signer;
  }
}
