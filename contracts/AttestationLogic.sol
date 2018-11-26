pragma solidity 0.4.24;

import "./SigningLogic.sol";
import "./TokenEscrowMarketplace.sol";
import "./Initializable.sol";

/**
 * @title AttestationLogic allows users to submit attestations given valid signatures
 * @notice Attestation Logic Logic provides a public interface for Bloom and
 *  users to submit attestations.
 */
contract AttestationLogic is Initializable, SigningLogic{
    TokenEscrowMarketplace public tokenEscrowMarketplace;

  /**
   * @notice AttestationLogic constructor sets the implementation address of all related contracts
   * @param _tokenEscrowMarketplace Address of marketplace holding tokens which are
   *  released to attesters upon completion of a job
   */
  constructor(
    address _initializer,
    TokenEscrowMarketplace _tokenEscrowMarketplace
    ) Initializable(_initializer) SigningLogic("Bloom Attestation Logic", "2", 1) public {
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

  /**
   * @notice Function for attester to submit attestation from their own account) 
   * @dev Wrapper for attestForUser using msg.sender
   * @param _subject User this attestation is about
   * @param _requester User requesting and paying for this attestation in BLT
   * @param _reward Payment to attester from requester in BLT
   * @param _requesterSig Signature authorizing payment from requester to attester
   * @param _dataHash Hash of data being attested and nonce
   * @param _requestNonce Nonce in sig signed by subject and requester so they can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   */
  function attest(
    address _subject,
    address _requester,
    uint256 _reward,
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
   * @param _requesterSig signature authorizing payment from requester to attester
   * @param _dataHash hash of data being attested and nonce
   * @param _requestNonce Nonce in sig signed by subject and requester so they can't be replayed
   * @param _subjectSig signed authorization from subject with attestation agreement
   * @param _delegationSig signature authorizing attestation on behalf of attester
   */
  function attestFor(
    address _subject,
    address _attester,
    address _requester,
    uint256 _reward,
    bytes _requesterSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig, // Sig of subject with dataHash and requestNonce
    bytes _delegationSig
  ) public {
    // Confirm attester address matches recovered address from signature
    validateAttestForSig(_subject, _attester, _requester, _reward, _dataHash, _requestNonce, _delegationSig);
    burnSignature(_attester, _requestNonce);
    attestForUser(
      _subject,
      _attester,
      _requester,
      _reward,
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
   * @param _requesterSig signature authorizing payment from requester to attester
   * @param _dataHash hash of data being attested and nonce
   * @param _requestNonce Nonce in sig signed by subject and requester so they can't be replayed
   * @param _subjectSig signed authorization from subject with attestation agreement
   */
  function attestForUser(
    address _subject,
    address _attester,
    address _requester,
    uint256 _reward,
    bytes _requesterSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig
    ) private {
    
    validateSubjectSig(
      _subject,
      _dataHash,
      _requestNonce,
      _subjectSig
    );
    burnSignature(_subject, _requestNonce);

    emit TraitAttested(
      _subject,
      _attester,
      _requester,
      _dataHash
    );

    if (_reward > 0) {
      tokenEscrowMarketplace.requestTokenPayment(_requester, _attester, _reward, _requestNonce, _requesterSig);
    }
  }

  /**
   * @notice Function for attester to reject an attestation and receive payment 
   *  without associating the negative attestation with the subject's bloomId
   * @param _requester User requesting and paying for this attestation in BLT
   * @param _reward Payment to attester from requester in BLT
   * @param _requestNonce Nonce in sig signed by requester so it can't be replayed
   * @param _requesterSig Signature authorizing payment from requester to attester
   */
  function contest(
    address _requester,
    uint256 _reward,
    bytes32 _requestNonce,
    bytes _requesterSig
  ) public {
    contestForUser(
      msg.sender,
      _requester,
      _reward,
      _requestNonce,
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
   * @param _requestNonce Nonce in sig signed by requester so it can't be replayed
   * @param _requesterSig Signature authorizing payment from requester to attester
   */
  function contestFor(
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _requestNonce,
    bytes _requesterSig,
    bytes _delegationSig
  ) public {
    validateContestForSig(
      _attester,
      _requester,
      _reward,
      _requestNonce,
      _delegationSig
    );
    burnSignature(_attester, _requestNonce);
    contestForUser(
      _attester,
      _requester,
      _reward,
      _requestNonce,
      _requesterSig
    );
  }

  /**
   * @notice Private function for attester to reject an attestation and receive payment 
   *  without associating the negative attestation with the subject's bloomId
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _requestNonce Nonce in sig signed by requester so it can't be replayed
   * @param _requesterSig signature authorizing payment from requester to attester
   */
  function contestForUser(
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _requestNonce,
    bytes _requesterSig
    ) private {

    if (_reward > 0) {
      tokenEscrowMarketplace.requestTokenPayment(_requester, _attester, _reward, _requestNonce, _requesterSig);
    }
    emit AttestationRejected(_attester, _requester);
  }

  /**
   * @notice Verify subject signature is valid 
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
  ) internal view {
    require(_subject == recoverSigner(
      generateRequestAttestationSchemaHash(
      _dataHash,
      _requestNonce
    ), _subjectSig));
  }

  /**
   * @notice Verify attester delegation signature is valid 
   * @param _subject user this attestation is about
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _dataHash hash of data being attested and nonce
   * @param _requestNonce nonce in sig signed by subject so it can't be replayed
   * @param _delegationSig signature authorizing attestation on behalf of attester
   */
  function validateAttestForSig(
    address _subject,
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _delegationSig
  ) internal view {
    require(_attester == recoverSigner(
      generateAttestForDelegationSchemaHash(
        _subject,
        _requester,
        _reward,
        _dataHash,
        _requestNonce
        ),
        _delegationSig), 'Invalid AttestFor Signature');
  }

  /**
   * @notice Verify attester delegation signature is valid 
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _requestNonce nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _delegationSig signature authorizing attestation on behalf of attester
   */
  function validateContestForSig(
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _requestNonce,
    bytes _delegationSig
  ) internal view {
    require(_attester == recoverSigner(
      generateContestForDelegationSchemaHash(
        _requester,
        _reward,
        _requestNonce
        ),
        _delegationSig), 'Invalid ContestFor Signature');
  }

  /**
   * @notice Submit attestation completed prior to deployment of this contract
   * @dev Gives initializer privileges to write attestations during the initialization period without signatures
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
    address _sender,
    bytes32 _link,
    bytes32 _nonce,
    bytes _delegationSig
    ) public {
      validateRevokeForSig(_sender, _link, _nonce, _delegationSig);
      burnSignature(_sender, _nonce);
      revokeAttestationForUser(_link, _sender);
  }

  /**
   * @notice Verify revocation signature is valid 
   * @param _link bytes string embedded in dataHash to link revocation
   * @param _sender user revoking attestation
   * @param _delegationSig signature authorizing revocation on behalf of revoker
   */
  function validateRevokeForSig(
    address _sender,
    bytes32 _link,
    bytes32 _nonce,
    bytes _delegationSig
  ) internal view {
    require(_sender == recoverSigner(
      generateRevokeAttestationForDelegationSchemaHash(
        _link,
        _nonce
        ),
        _delegationSig), 'Invalid RevokeFor Signature');
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
