pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountRegistryInterface.sol";
import "./SigningLogicInterface.sol";
import "./TokenEscrowMarketplace.sol";
import "./AttestationRepoInterface.sol";

/**
 * @title AttestationLogic manages the interactions with AttestationRepo
 * @notice Attestation Logic Logic provides a public interface for Bloom and
 *  users to submit attestations to the Attestation Repo.
 *  As the Bloom protocol matures, this contract can be upgraded to enable new
 * capabilities without needing to migrate the underlying Attestation Repo storage contract.
 */
contract AttestationLogic is Ownable{
    AccountRegistryInterface public registry;
    AttestationRepoInterface public attestationRepo;
    SigningLogicInterface public signingLogic;
    TokenEscrowMarketplace public tokenEscrowMarketplace;
    address public admin;

  /**
   * @notice AttestationLogic constructor sets the implementation address of all related contracts
   * @param _registry Address of deployed AccountRegistry implementation (upgradeable)
   * @param _signingLogic Address of deployed signing logic implementation (upgradeable)
   * @param _attestationRepo Address of deployed attestation repo (upgradeable)
   * @param _tokenEscrowMarketplace Address of marketplace holding tokens which are
   *  released to attesters upon completion of a job
   */
  constructor(
    AccountRegistryInterface _registry,
    AttestationRepoInterface _attestationRepo,
    SigningLogicInterface _signingLogic,
    TokenEscrowMarketplace _tokenEscrowMarketplace
    ) public {
    attestationRepo = _attestationRepo;
    registry = _registry;
    signingLogic = _signingLogic;
    tokenEscrowMarketplace = _tokenEscrowMarketplace;
    admin = owner;
  }

  event TraitAttested(
    uint256 attestationId,
    uint256 subjectId,
    uint256 attesterId,
    uint256 requesterId,
    bytes32 dataHash,
    uint256 stakeValue,
    uint256 expiresAt
    );
  event AttestationRejected(uint256 indexed attesterId, uint256 indexed requesterId);
  event StakeRevoked(uint256 indexed subjectId, uint256 attestationId, uint256 indexed stakerId);
  event AttestationRevoked(bytes32 link, uint256 indexed attesterId);
  event StakeSubmitted(uint256 indexed subjectId, uint256 indexed stakerId, uint256 attestationId, uint256 expiresAt);
  event StakedTokensReclaimed(uint256 indexed stakerId, uint256 value);
  event AccountRegistryChanged(address oldRegistry, address newRegistry);
  event AttestationRepoChanged(address oldAttestationRepo, address newAttestationRepo);
  event SigningLogicChanged(address oldSigningLogic, address newSigningLogic);
  event TokenEscrowMarketplaceChanged(address oldTokenEscrowMarketplace, address newTokenEscrowMarketplace);
  event AdminChanged(address oldAdmin, address newAdmin);

  /**
   * @dev Zero address not allowed
   */
  modifier nonZero(address _address) {
    require(_address != 0);
    _;
  }

  modifier onlyAdmin {
    require(msg.sender == admin);
    _;
  }

  struct Attestation {
    uint256 attesterId;
    uint256 completedAt;
    uint256 stakeValue;
    uint256 expiresAt;
  }

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
   * @notice Submit attestation for a user by the owner of the AttestationRepo contract in order to pay the gas costs
   * @dev Recover signer of delegation message. If attester matches delegation signature, add the attestation
   * @param _subject user this attestation is about
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _reward payment to attester from requester in BLT wei
   * @param _paymentNonce nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig signature authorizing payment from requester to attester
   * @param _dataHash hash of data being attested and nonce
   * param _requestNonce nonce in sig signed by subject so it can't be replayed
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
  ) public onlyAdmin {
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
      _attester,
      _requester,
      _dataHash,
      _requestNonce,
      _subjectSig
    );

    submitAttestation(
      _subject,
      _attester,
      _requester,
      _dataHash,
      0,
      0
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
   *  Perform by admin on behalf of attester to pay gas fees
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
  ) public onlyAdmin {
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

    uint256 _requesterId = registry.accountIdForAddress(_requester);
    uint256 _attesterId = registry.accountIdForAddress(_attester);
    
    if (_reward > 0) {
      tokenEscrowMarketplace.requestTokenPayment(_requester, _attester, _reward, _paymentNonce, _requesterSig);
    }
    emit AttestationRejected(_attesterId, _requesterId);
  }

  /**
   * @notice Verify subject signature is valid and unused 
   * @param _subject user this attestation is about
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _dataHash hash of data being attested and nonce
   * param _requestNonce Nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   */
  function validateSubjectSig(
    address _subject,
    address _attester,
    address _requester,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig
  ) public {

    require(!usedSignatures[keccak256(abi.encodePacked(_subjectSig))], "Signature not unique");
    usedSignatures[keccak256(abi.encodePacked(_subjectSig))] = true;

    require(_subject == signingLogic.recoverSigner(
      signingLogic.generateRequestAttestationSchemaHash(
      _subject,
      _attester,
      _requester,
      _dataHash,
      _requestNonce
    ), _subjectSig));
  }

  /**
   * @notice Submit attestation to attestation repo
   * @dev Separated into another funtion because otherwise call stack too deep
   * @dev Verify valid certainty level and user addresses
   * @param _subject user this attestation is about
   * @param _attester user completing the attestation
   * @param _requester user requesting this attestation be completed and paying for it in BLT
   * @param _dataHash hash of data being attested and nonce
   * @param _stakeValue BLT to lock up in collateral contract
   * @param _expiresAt Time when stake will expire
   */
  function submitAttestation(
    address _subject,
    address _attester,
    address _requester,
    bytes32 _dataHash,
    uint256 _stakeValue,
    uint256 _expiresAt
  ) private{

    uint256 _requesterId = registry.accountIdForAddress(_requester);
    uint256 _attesterId = registry.accountIdForAddress(_attester);
    uint256 _subjectId = registry.accountIdForAddress(_subject);


    uint256 _attestationId = attestationRepo.writeAttestation(
      _subjectId,
      _attesterId,
      now,
      _stakeValue,
      _expiresAt
    );

    emit TraitAttested(
      _attestationId,
      _subjectId,
      _attesterId,
      _requesterId,
      _dataHash,
      _stakeValue,
      _expiresAt
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
    ) public onlyAdmin {
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

      uint256 _senderId = registry.accountIdForAddress(_sender);

      emit AttestationRevoked(_link, _senderId);
  }


  /**
   * @notice Submit an attestation and transfer tokens to a collateral contract from the staker
   *  for the specified amount of time
   * @param _subject User who is subject of attestation and of stake
   * @param _value BLT to lock up in collateral contract
   * @param _paymentNonce Nonce in PaymentSig to add randomness to payment authorization
   * @param _paymentSig Signature from staker authorizing tokens to be released to collateral contract
   * @param _dataHash Hash of data being attested and nonce
   * param _requestNonce Nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   * @param _stakeDuration Time until stake will be complete, max 1 year
   */
  function stake(
    address _subject,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes _paymentSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig,
    uint256 _stakeDuration
  ) public {
    stakeForUser(
      _subject,
      msg.sender,
      _value,
      _paymentNonce,
      _paymentSig,
      _dataHash,
      _requestNonce,
      _subjectSig,
      _stakeDuration
    );
  }

  /**
   * @notice Submit an attestation and transfer tokens to a collateral contract from the staker
   *  for the specified amount of time. Perform by admin on behalf of staker in order 
   *  to pay tx fees
   * @param _subject User who is subject of attestation and of stake
   * @param _staker User who is attesting and staking for subject
   * @param _value BLT to lock up in collateral contract
   * @param _paymentNonce Nonce in PaymentSig to add randomness to payment authorization
   * @param _paymentSig Signature from staker authorizing tokens to be released to collateral contract
   * @param _dataHash Hash of data being attested and nonce
   * @param _requestNonce Nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   * @param _stakeDuration Time until stake will be complete, max 1 year
   * @param _delegationSig signature authorizing attestation on behalf of staker
   */
  function stakeFor(
    address _subject,
    address _staker,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes _paymentSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig,
    uint256 _stakeDuration,
    bytes _delegationSig
  ) public onlyAdmin {
    // Reconstruct stake delegation message
    bytes32 _delegationDigest = signingLogic.generateStakeForDelegationSchemaHash(
      _subject,
      _value,
      _paymentNonce,
      _dataHash,
      _requestNonce,
      _stakeDuration
    );
    require(_staker == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
    stakeForUser(
      _subject,
      _staker,
      _value,
      _paymentNonce,
      _paymentSig,
      _dataHash,
      _requestNonce,
      _subjectSig,
      _stakeDuration
    );
  }


  /**
   * @notice Submit an attestation and transfer tokens to a collateral contract from the staker
   *  for the specified amount of time
   * @param _subject User who is subject of attestation and of stake
   * @param _staker User who is attesting and staking for subject
   * @param _value BLT to lock up in collateral contract
   * @param _paymentNonce Nonce in PaymentSig to add randomness to payment authorization
   * @param _paymentSig Signature from staker authorizing tokens to be released to collateral contract
   * @param _dataHash Hash of data being attested and nonce
   * @param _requestNonce Nonce in sig signed by subject so it can't be replayed
   * @param _subjectSig Signed authorization from subject with attestation agreement
   * @param _stakeDuration Time until stake will be complete, max 1 year
   */
  function stakeForUser(
    address _subject,
    address _staker,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes _paymentSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig,
    uint256 _stakeDuration
    ) private {

    validateSubjectSig(
      _subject,
      _staker,
      _subject,
      _dataHash,
      _requestNonce,
      _subjectSig
    );

    uint256 _expiresAt = now + _stakeDuration;
    require(_expiresAt < now + 366 days);

    submitAttestation(
      _subject,
      _staker,
      _subject,
      _dataHash,
      _value,
      _expiresAt
    );

    if (_value > 0) {
      tokenEscrowMarketplace.requestTokenPayment(_staker, attestationRepo, _value, _paymentNonce, _paymentSig);
    }
  }

  /**
   * @notice Reclaim staked tokens for an expired stake
   * @param _subjectId User who is subject of attestation and of stake
   * @param _attestationId Id of attestation in attestationRepo
   */
  function reclaimStakedTokens(
    uint256 _attestationId,
    uint256 _subjectId
    ) public {
      reclaimStakedTokensForUser(_subjectId, msg.sender, _attestationId);
  }

  /**
   * @notice Reclaim staked tokens for an expired stake on behalf of a user 
   *  in order to pay the gas costs
   * @param _subjectId User who is subject of attestation and of stake
   * @param _staker User who is attesting and staking for subject
   * @param _attestationId Id of attestation in attestationRepo
   */
  function reclaimStakedTokensFor(
    uint256 _subjectId,
    address _staker,
    uint256 _attestationId
    ) public onlyAdmin {
      reclaimStakedTokensForUser(_subjectId, _staker, _attestationId);
  }

  /**
   * @notice Reclaim staked tokens for an expired stake
   * @param _subjectId User who is subject of attestation and of stake
   * @param _staker User who is attesting and staking for subject
   * @param _attestationId Id of attestation in attestationRepo
   */
  function reclaimStakedTokensForUser(
    uint256 _subjectId,
    address _staker,
    uint256 _attestationId
  ) private {
    uint256 _stakerId = registry.accountIdForAddress(_staker);

    uint256 _stakeStakerId;
    uint256 _completedAt;
    uint256 _stakeValue;
    uint256 _stakeExpiresAt;

    (
      _stakeStakerId,
      _completedAt,
      _stakeValue,
      _stakeExpiresAt
      ) = attestationRepo.readAttestation(_subjectId, _attestationId);

    require(_stakerId == _stakeStakerId);
    require(now >= _stakeExpiresAt);
    require(_stakeValue > 0);

    attestationRepo.writeStake(
      _subjectId,
      _attestationId,
      0,
      _stakeExpiresAt
    );
    attestationRepo.transferTokensToStaker(_staker, _stakeValue);
    emit StakedTokensReclaimed(_stakerId, _stakeValue);
  }

  /**
   * @notice End a stake early and reclaim tokens
   * @param _subjectId User who is subject of attestation and of stake
   * @param _attestationId Id of attestation in attestationRepo
   */
  function revokeStake(
    uint256 _subjectId,
    uint256 _attestationId
    ) public {
      revokeStakeForUser(_subjectId, msg.sender, _attestationId);
  }

  /**
   * @notice End a stake early and reclaim tokens
   *  Perform by admin on behalf of staker in order to pay tx fees
   * @param _subjectId User who is subject of attestation and of stake
   * @param _staker User who is attesting and staking for subject
   * @param _attestationId Id of attestation in attestationRepo
   * @param _delegationSig signature authorizing attestation on behalf of staker
   */
  function revokeStakeFor(
    uint256 _subjectId,
    address _staker,
    uint256 _attestationId,
    bytes _delegationSig
  ) public onlyAdmin {
    // Reconstruct stake delegation message
    bytes32 _delegationDigest = signingLogic.generateRevokeStakeForDelegationSchemaHash(
      _subjectId,
      _attestationId
    );
    // Confirm attester address matches recovered address from signature
    require(_staker == signingLogic.recoverSigner(_delegationDigest, _delegationSig));
    revokeStakeForUser(_subjectId, _staker, _attestationId);
  }


  /**
   * @notice End a stake early and reclaim tokens
   * @param _subjectId User who is subject of attestation and of stake
   * @param _staker User who is attesting and staking for subject
   * @param _attestationId Id of attestation in attestationRepo
   */
  function revokeStakeForUser(
    uint256 _subjectId,
    address _staker,
    uint256 _attestationId
  ) private {
    uint256 _stakerId = registry.accountIdForAddress(_staker);

    uint256 _stakeStakerId;
    uint256 _completedAt;
    uint256 _stakeValue;
    uint256 _stakeExpiresAt;
    (_stakeStakerId, _completedAt, _stakeValue, _stakeExpiresAt) = attestationRepo.readAttestation(_subjectId, _attestationId);
    require(_stakerId == _stakeStakerId);
    require(_stakeExpiresAt > now);

    attestationRepo.writeStake(
      _subjectId,
      _attestationId,
      0,
      now
    );
    attestationRepo.transferTokensToStaker(_staker, _stakeValue);
    emit StakedTokensReclaimed(_stakerId, _stakeValue);
    emit StakeRevoked(_subjectId, _attestationId, _stakerId);
  }

  function setAdmin(address _newAdmin) public onlyOwner nonZero(_newAdmin) {
    address _oldAdmin = admin;
    admin = _newAdmin;
    emit AdminChanged(_oldAdmin, admin);
  }

  /**
   * @notice Change the address of AccountRegistry, which enables authorization of subject comments
   * @dev Restricted to AttestationLogic owner and new address cannot be 0x0
   * @param _newRegistry Address of new Account Registry contract
   */
  function setAccountRegistry(AccountRegistryInterface _newRegistry) public nonZero(_newRegistry) onlyOwner {
    address oldRegistry = registry;
    registry = _newRegistry;
    // escrowRegistry = _newRegistry;
    emit AccountRegistryChanged(oldRegistry, registry);
  }

  /**
   * @notice Change the implementation of the SigningLogic contract by setting a new address
   * @dev Restricted to AttestationLogic owner and new implementation address cannot be 0x0
   * @param _newSigningLogic Address of new SigningLogic implementation
   */
  function setSigningLogic(SigningLogicInterface _newSigningLogic) public nonZero(_newSigningLogic) onlyOwner {
    address oldSigningLogic = signingLogic;
    signingLogic = _newSigningLogic;
    emit SigningLogicChanged(oldSigningLogic, signingLogic);
  }

  /**
   * @notice Change the implementation of the AttestationRepo contract by setting a new address
   * @dev Restricted to AttestationLogic owner and new implementation address cannot be 0x0
   * @param _newAttestationRepo Address of new SigningLogic implementation
   */
  function setAttestationRepo(AttestationRepoInterface _newAttestationRepo) public nonZero(_newAttestationRepo) onlyOwner {
    address oldAttestationRepo = attestationRepo;
    attestationRepo = _newAttestationRepo;
    emit AttestationRepoChanged(oldAttestationRepo, attestationRepo);
  }

  /**
   * @notice Change the implementation of the TokenEscrowMarketplace contract by setting a new address
   * @dev Restricted to owner and new implementation address cannot be 0x0
   * @param _newTokenEscrowMarketplace Address of new SigningLogic implementation
   */
  function setTokenEscrowMarketplace(TokenEscrowMarketplace _newTokenEscrowMarketplace) public nonZero(_newTokenEscrowMarketplace) onlyOwner {
    address oldTokenEscrowMarketplace = tokenEscrowMarketplace;
    tokenEscrowMarketplace = _newTokenEscrowMarketplace;
    emit TokenEscrowMarketplaceChanged(oldTokenEscrowMarketplace, tokenEscrowMarketplace);
  }

}
