pragma solidity 0.4.24;

import "./SigningLogicInterface.sol";
import "./TokenEscrowMarketplace.sol";
import "./Initializable.sol";

/**
 * @title AttestationLogic allows users to submit attestations given valid signatures
 * @notice Attestation Logic Logic provides a public interface for Bloom and
 *  users to submit attestations.
 */
contract AttestationLogic is Initializable{
    SigningLogicInterface public signingLogic;
    TokenEscrowMarketplace public tokenEscrowMarketplace;

  /**
   * @notice AttestationLogic constructor sets the implementation address of all related contracts
   * @param _signingLogic Address of deployed signing logic implementation (upgradeable)
   * @param _tokenEscrowMarketplace Address of marketplace holding tokens which are
   *  released to attesters upon completion of a job
   */
  constructor(
    address _initializer,
    SigningLogicInterface _signingLogic,
    TokenEscrowMarketplace _tokenEscrowMarketplace
    ) Initializable(_initializer) public {
    signingLogic = _signingLogic;
    tokenEscrowMarketplace = _tokenEscrowMarketplace;
  }

  event TraitAttested(
    address subject,
    address attester,
    address requester,
    bytes32 dataHash
    );
  event AttestationRejected(address indexed attester, address indexed requester);
  event AttestationRevoked(bytes32 link, address attester);
  event TokenEscrowMarketplaceChanged(address oldTokenEscrowMarketplace, address newTokenEscrowMarketplace);

  // Mapping of nonce per subject. Sigs can only be used once
  mapping(bytes32 => bool) public usedSignatures;

  /**
   * @notice Function for attester to submit attestation from their own account) 
   * @dev Wrapper for attestForUser using msg.sender
   * @param _subject User this attestation is about
   * @param _requester User requesting and paying for this attestation in BLT
   * @param _reward Payment to attester from requester in BLT
   * @param _paymentNonce Nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig Signature authorizing payment from requester to attester
   * @param _dataHash Hash of data being attested and nonce
   * param _requestNonce Nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   */
  function attest(
    address _subject,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig // Sig of subject with requester, attester, dataHash, requestNonce
  ) public {
    attestForUser(
      _subject,
      msg.sender,
      _requester,
      _reward,
      _paymentNonce,
      _requesterSig,
      _dataHash,
      _requestNonce,
      _subjectSig
    );
  }

  /**
   * @notice Submit attestation for a user in order to pay the gas costs
   * @dev Recover signer of delegation message. If attester matches delegation signature, add the attestation
   * @param _subject user this attestation is about
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _paymentNonce nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig signature authorizing payment from requester to attester
   * @param _dataHash hash of data being attested and nonce
   * @param _requestNonce nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig signed authorization from subject with attestation agreement
   * @param _delegationSig signature authorizing attestation on behalf of attester
   */
  function attestFor(
    address _subject,
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig, // Sig of subject with requester, attester, dataHash, requestNonce
    bytes _delegationSig
  ) public {
    // Reconstruct attestation delegation message
    bytes32 _delegationDigest = signingLogic.generateAttestForDelegationSchemaHash(
      _subject,
      _requester,
      _reward,
      _paymentNonce,
      _dataHash,
      _requestNonce
    );
    // Confirm attester address matches recovered address from signature
    require(_attester == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
    attestForUser(
      _subject,
      _attester,
      _requester,
      _reward,
      _paymentNonce,
      _requesterSig,
      _dataHash,
      _requestNonce,
      _subjectSig
    );
  }

  /**
   * @notice Perform attestation
   * @dev Verify valid certainty level and user addresses
   * @param _subject user this attestation is about
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _paymentNonce nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig signature authorizing payment from requester to attester
   * @param _dataHash hash of data being attested and nonce
   * param _requestNonce nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig signed authorization from subject with attestation agreement
   */
  function attestForUser(
    address _subject,
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig // Sig of subject with requester, attester, dataHash, requestNonce
    ) private {
    
    validateSubjectSig(
      _subject,
      _dataHash,
      _requestNonce,
      _subjectSig
    );

    emit TraitAttested(
      _subject,
      _attester,
      _requester,
      _dataHash
    );

    if (_reward > 0) {
      tokenEscrowMarketplace.requestTokenPayment(_requester, _attester, _reward, _paymentNonce, _requesterSig);
    }
  }

  /**
   * @notice Function for attester to reject an attestation and receive payment 
   *  without associating the negative attestation with the subject's bloomId
   * @param _requester User requesting and paying for this attestation in BLT
   * @param _reward Payment to attester from requester in BLT
   * @param _paymentNonce Nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig Signature authorizing payment from requester to attester
   */
  function contest(
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig
  ) public {
    contestForUser(
      msg.sender,
      _requester,
      _reward,
      _paymentNonce,
      _requesterSig
    );
  }

  /**
   * @notice Function for attester to reject an attestation and receive payment 
   *  without associating the negative attestation with the subject's bloomId
   *  Perform on behalf of attester to pay gas fees
   * @param _requester User requesting and paying for this attestation in BLT
   * @param _attester user completing the attestation
   * @param _reward Payment to attester from requester in BLT
   * @param _paymentNonce Nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig Signature authorizing payment from requester to attester
   */
  function contestFor(
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig,
    bytes _delegationSig
  ) public {
    // Reconstruct attestation delegation message
    bytes32 _delegationDigest = signingLogic.generateContestForDelegationSchemaHash(
      _requester,
      _reward,
      _paymentNonce
    );
    require(_attester == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
    contestForUser(
      _attester,
      _requester,
      _reward,
      _paymentNonce,
      _requesterSig
    );
  }

  /**
   * @notice Private function for attester to reject an attestation and receive payment 
   *  without associating the negative attestation with the subject's bloomId
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _paymentNonce nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig signature authorizing payment from requester to attester
   */
  function contestForUser(
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig
    ) private {

    if (_reward > 0) {
      tokenEscrowMarketplace.requestTokenPayment(_requester, _attester, _reward, _paymentNonce, _requesterSig);
    }
    emit AttestationRejected(_attester, _requester);
  }

  /**
   * @notice Verify subject signature is valid and unused 
   * @param _subject user this attestation is about
   * @param _dataHash hash of data being attested and nonce
   * param _requestNonce Nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   */
  function validateSubjectSig(
    address _subject,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig
  ) public {

    require(!usedSignatures[keccak256(abi.encodePacked(_subjectSig))], "Signature not unique");
    usedSignatures[keccak256(abi.encodePacked(_subjectSig))] = true;

    require(_subject == signingLogic.recoverSigner(
      signingLogic.generateRequestAttestationSchemaHash(
      _dataHash,
      _requestNonce
    ), _subjectSig));
  }

  /**
   * @notice Submit attestation completed prior to deployment of this contract
   * @dev Gives initializer privileges to write migrate attestations during the initialization period without signatures
   * @param _requester user requesting this attestation be completed 
   * @param _attester user completing the attestation
   * @param _subject user this attestation is about
   * @param _dataHash hash of data being attested
   */
  function migrateAttestation(
    address _requester,
    address _attester,
    address _subject,
    bytes32 _dataHash
  ) public onlyDuringInitialization {
    emit TraitAttested(
      _subject,
      _attester,
      _requester,
      _dataHash
    );
  }

  /**
   * @notice Revoke an attestation
   * @dev Link is included in dataHash and cannot be directly connected to a BloomID
   * @param _link bytes string embedded in dataHash to link revocation
   */
  function revokeAttestation(
    bytes32 _link
    ) public {
      revokeAttestationForUser(_link, msg.sender);
  }

  /**
   * @notice Revoke an attestation
   * @dev Link is included in dataHash and cannot be directly connected to a BloomID
   * @param _link bytes string embedded in dataHash to link revocation
   */
  function revokeAttestationFor(
    bytes32 _link,
    address _sender,
    bytes _delegationSig
    ) public {
      bytes32 _delegationDigest = signingLogic.generateRevokeAttestationForDelegationSchemaHash(
        _link
      );
      require(_sender == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
      revokeAttestationForUser(_link, _sender);
  }

  /**
   * @notice Revoke an attestation
   * @dev Link is included in dataHash and cannot be directly connected to a BloomID
   * @param _link bytes string embedded in dataHash to link revocation
   * @param _sender address identify revoker
   */
  function revokeAttestationForUser(
    bytes32 _link,
    address _sender
    ) private {
      emit AttestationRevoked(_link, _sender);
  }

    /**
   * @notice Set the implementation of the TokenEscrowMarketplace contract by setting a new address
   * @dev Restricted to initializer
   * @param _newTokenEscrowMarketplace Address of new SigningLogic implementation
   */
  function setTokenEscrowMarketplace(TokenEscrowMarketplace _newTokenEscrowMarketplace) public onlyDuringInitialization {
    address oldTokenEscrowMarketplace = tokenEscrowMarketplace;
    tokenEscrowMarketplace = _newTokenEscrowMarketplace;
    emit TokenEscrowMarketplaceChanged(oldTokenEscrowMarketplace, tokenEscrowMarketplace);
  }

}
