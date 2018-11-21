These contracts are documented on Bloom's website here: https://bloom.co/docs

The documentation is also available in the readme below.

# Contract Summaries

**Accounts**

Anyone can use the Bloom Protocol smart contracts using any address. Bloom supports regular EOA addresses or smart contracts like multisigs. The AccountRegistryLogic contract enables users to demonstrate ownership of multiple addresses by linking the addresses on chain.

**Signing Logic**

Bloom relies on the signTypedData proposal described in EIP712 for many protocol interactions including allowing users to delegate transactions to Bloom to pay transaction costs. The SigningLogic contract contains all of the logic to recover addresses from signTypedData signatures.

**Attestations**

One of the core components of Bloom protocol is Identity Attestations. The attestations contracts enable users to securely associate verified identity information with their BloomID in order to strengthen their profile.

**Accreditation**

Bloom maintains a whitelist of accredited data verifiers via an Accreditation Repo. Currently Bloom retains the rights to grant and revoke accreditation. In the future this contract can be upgraded to enable community voting based accreditation.

**Token Escrow** 

Users can lock up BLT in the Token Escrow contract. Once locked up users can send micropayments to other users by signing payment authorizations.

**Voting**

Bloom’s protocol heavily relies on community voting to make important protocol decisions. Anyone can create a Poll in the Bloom network by interacting with the VotingCenter contract.

# Getting Started

1. Clone the repository
2. Run `yarn install` to install dependencies
3. Copy `truffle.js.example` to `truffle.js`
4. Compile contract typings `./bin/compile-typings`
5. Run tests with `./bin/test`

If you plan to use a truffleLedgerProvider, also do `yarn add @ledgerhq/hw-transport-node-hid@4.2.0`
It was removed from package.json due to an issue with CI's test machines

## Making Changes

The tests are written in Typescript. If you make changes to the contracts which impact the ABI, update the typings with:

`./bin/compile-typings --reset`

The tests are in the `ts_test` folder. They are separated by contract. Each test follows the same basic structure.

1. Load the contract and the relevant interfaces
2. Import the test-rpc accounts
3. Initialize the accounts with properties relevant to the contract (create accounts, gift them tokens, etc)
4. Test each contract function


## 3rd Party Contract Dependencies
|File|Dependencies|Description|
|---|---|---|
|AccreditationRepo.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AirdropProxy.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AirdropProxy.sol|open-zeppelin#Pausable|This contract holds collateralized tokens so it should be able to be paused if a vulnerability is discovered|
|AirdropProxy.sol|open-zeppelin#SafeERC20|Wrapper for ERC20 methods that throw on failure|
|AirdropProxy.sol|open-zeppelin#ERC20|ERC20 methods to enable this contract to interact with BLT|
|AirdropProxy.sol|open-zeppelin#HasNoEther|Enables owner to retrieve eth from this contract and attempts to stop eth from being deposited|
|SigningLogic.sol|open-zeppelin#ECRecovery|ECRecovery.recover is used for all delegated transactions and other interactions requiring a signature from the user|
|TokenEscrowMarketplace.sol|open-zeppelin#SafeERC20|Wrapper for ERC20 methods that throw on failure|
|TokenEscrowMarketplace.sol|open-zeppelin#ERC20|ERC20 methods to enable this contract to interact with BLT|
|TokenEscrowMarketplace.sol|open-zeppelin#SafeMath|Safety checks for math operations to manipulate escrow balances|


# Design Patterns
## Hard Fork Upgrades
Previously Bloom's smart contracts used the separate storage & logic contract design pattern. This enabled Bloom to swap out contract logic to fix bugs or add features. As the protocol has matured this centralized control is no longer appropriate. Contract storage and logic is now immutable upon deployment and initialization. Upgrades can only be made by deploying new contracts and recommending the community transition to the new contracts.

## Initializable
Contracts inherit Initializable.sol to allow a specified address to migrate data without signature validation. This is only allowed during initialization of the contract and the privilege is removed once migration is complete.

## Delegated Transactions
Users can delegate certain protocol actions have a third party pay the transaction fees. Many functions throughout these contracts are implemented with 3 functions.

* Action - Public function enabling users to interact with the contract directly
* ActionFor - Delegated function enabling 3rd party to call *Action* on behalf of a user
* ActionForUser - Private function enabling the logic of this action. Both *Action* and *ActionFor* call *ActionForUser*.

Users authorize a 3rd party to perform actions on their behalf by signing a message containing their intended protocol action with a private key. Each signature contains a nonce to make the signature single-use. The contracts maintain a mapping of used signatures.

`mapping (bytes32 => bool) public usedSignatures;`

If a user signs a delegated transaction, the 3rd party is only able to submit that signature one time. If the user needs to complete the same action again, they sign a new delegated transaction with a new nonce.

The signature definition is contained in the Signing Logic contract. This contract is inherited by all contracts needing delegated actions.

# Account Registry
*Account Registry Logic* implements the storage and logic to enable users to link multiple addresses to the same owner.

## Account Registry Data Structures
Links are stored as mapping from addresses to a link Id. Users can have any number of addresses point to the same linkId.

```
  mapping(address => uint256) public linkIds;
```

## Account Registry Logic Public Functions
### linkIds
Public getter to check if an address is linked to another address. Returns 0 if no link.
Retrieve the account Id associated with an address. Reverts if the address is not associated with an account
#### Interface
```
function linkIds(address _address) public view returns (uint256)
```
#### Example - Check if two addresses have the same owner
```
// Web3
const addressA = '0xabc123...'
const addressB = '0xdef456...'
accountRegistry = AccountRegistryLogic.at("0x123...")
const linkA = accountRegistry.linkIds.call(addressA)
const linkB = accountRegistry.linkIds.call(addressB)
if (linkA === linkB && linkA !== 0) {
  // Addresses are linked
}
```

### linkAddresses
Store a link demonstrating ownership of multiple addresses. Each address much sign a message indicating intention to be linked. `currentAddress` may be linked to other addresses. `newAddress` must be unclaimed.

A user can submit this transaction from their own address or it can be submitted by a third party on their behalf.
#### Interface
```
  /**
   * @notice Add an address to an existing id by a user
   * @param _newAddress Address to add to account
   * @param _newAddressSig Signed message from new address confirming ownership by the sender
   * @param _senderSig Signed message from new address confirming intention by the sender
   * @param _nonce Random hex string used when generating sigs to make them one time use
   */
  function linkAddresses(
    address _currentAddress,
    bytes _currentAddressSig,
    address _newAddress,
    bytes _newAddressSig,
    bytes32 _nonce
    ) public;
```
#### Example
```
// Add Address Signature Format
const getFormattedTypedDataAddAddress = (
  contractAddress: string,
  chainId: number,
  addressToAdd: string,
  nonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      AddAddress: [
        { name: 'addressToAdd', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'AddAddress',
    domain: {
      name: 'Bloom Account Registry',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      addressToAdd: addressToAdd,
      nonce: nonce
    }
  }
}

//Web3 pseudocode
registryLogic = AccountRegistryLogic.at("0x123...")
nonce = soliditySha3(uuid())

newAddressLinkSig = ethSigUtil.signTypedData(unclaimedPrivkey, {
  data: getFormattedTypedDataAddAddress(registryLogicAddress, 1, alice, nonce)
})

currentAddressLinkSig = ethSigUtil.signTypedData(alicePrivkey, {
  data: getFormattedTypedDataAddAddress(registryLogicAddress, 1, unclaimed, nonce)
})

registryLogic.linkAddresses(alice, currentAddressLinkSig, unclaimed, newAddressLinkSig, nonce, {from: anyone})
```

### unlinkAddress
Remove an address from a link to end the relationship between the specified address and other addresses which map to the same linkId. An address can unlink itself from a link or it can unlink any other linked address.

A user can submit this transaction from their own address or it can be submitted by a third party on their behalf.
#### Interface
```
  function unlinkAddress(
    address _senderAddress,
    address _addressToRemove,
    bytes32 _nonce,
    bytes _unlinkSignature
  ) public;
```
#### Example
```
const getFormattedTypedDataRemoveAddress = (
  contractAddress: string,
  chainId: number,
  addressToRemove: string,
  nonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
      ],
      RemoveAddress: [
        { name: 'addressToRemove', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'RemoveAddress',
    domain: {
      name: 'Bloom Account Registry',
      version: '2',
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      addressToRemove: addressToRemove,
      nonce: nonce
    }
  }
}

//Web3 pseudocode to unlink a linked address
registryLogic = AccountRegistryLogic.at("0x123...")
nonce = soliditySha3(uuid())

await registryLogic.linkAddresses(alice, currentAddressLinkSig, unclaimed, newAddressLinkSig, nonce, { from: alice })
await registryLogic.unlinkAddress(
  alice,
  unclaimed,
  nonce,
  ethSigUtil.signTypedData(alicePrivkey, {
    data: getFormattedTypedDataRemoveAddress(registryLogicAddress, 1, unclaimed, nonce)
  }),
  { from: alice }
)

//Web3 pseudocode to unlink self
await registryLogic.unlinkAddress(
  alice,
  alice,
  nonce,
  ethSigUtil.signTypedData(alicePrivkey, {
    data: getFormattedTypedDataRemoveAddress(registryLogicAddress, 1, alice, nonce)
  }),
  { from: alice }
)

```

# Signing Logic
Bloom relies on the `signTypedData` proposal described in EIP712 for many protocol interactions including allowing users to delegate transactions to Bloom to pay transaction costs. These proposals can be subject to breaking changes so in order to be flexible, Bloom has isolated the logic related to generating and recovering `signTypedData` signatures to a standalone *SigningLogic* contract. 

**SigningLogic** `0xd51D87B9F6886f0Ce792D062E49003d1ACEB6BEf`

## recoverSigner
Recover Signer returns the address of the user who signed a message.
### Interface
```
  function recoverSigner(bytes32 _hash, bytes _sig) external pure returns (address)
```

## Bloom SignTypedData Domain
Each signature contains a domain specification so the user understands how their signature will be used. The domain specifies the dApp name, version, chain Id and the contract intended to use the signatures.
```
  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version)"
  );

  bytes32 DOMAIN_SEPARATOR = hash(EIP712Domain({
      name: "Bloom",
      version: '1',
    }));

  struct EIP712Domain {
      string  name;
      string  version;
  }

  function hash(EIP712Domain eip712Domain) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256(bytes(eip712Domain.name)),
      keccak256(bytes(eip712Domain.version)),
    ));
  }
```


## SignTypedData Schemas
In order to recover the signer of a `signTypedData` signature, the contract must know the message that was signed. SigningLogic provides functions to generate the digest for every `signTypedData` action in the Bloom dApp.
### Example Schema
```
  struct AddAddress {
      address sender;
      bytes32 nonce;
  }

  bytes32 constant ADD_ADDRESS_TYPEHASH = keccak256(
    "AddAddress(address sender,bytes32 nonce)"
  );

  function hash(AddAddress request) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      ADD_ADDRESS_TYPEHASH,
      request.sender,
      request.nonce
    ));
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
```

### Web3 Example
```
export const getFormattedTypedDataAddAddress = (
  sender: string,
  nonce: string,
): IFormattedTypedData => {
  return {
    types: {
      EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
      ],
      AddAddress: [
        { name: 'sender', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'AddAddress',
    domain: {
      name: 'Bloom',
      version: '1',
    },
    message: {
      sender: sender,
      nonce: nonce
    }
  }
}

newAddressSig = ethSigUtil.signTypedData(
  newWallet.privateKey,
  {data: getFormattedTypedDataAddAddress(
    currentAddress,
    nonce
  )}
)
senderSig = ethSigUtil.signTypedData(
  currentWallet.privateKey,
  {data: getFormattedTypedDataAddAddress(
    newAddress,
    nonce
  )}
)
```

# Attestation Repo
*Attestation Repo* implements the data structures to store attestations and stakes, as well a the low-level read/ write functions. The functions are not publicly accessible. *Attestation Logic* implements the public functions which access the functions in *Attestation Repo* and emits events to store the data associated with an attestation. An attestation written to the *Attestation Repo* indicates that a data verifier has positively verified the information contained in dataHash (stored in the attestation event).

The Attestation struct also contains staking information. A stake is written to the attestation struct indicating a user has locked up tokens for a specified amount of time in order to vouch for the validity of an attestation. During the stake period, *Attestation Repo* is the owner of the tokens. The user withdraws their staked tokens via *Attestation Logic*


## Attestation Data Structures
Attestations are stored as a mapping from BloomId to an array of attestation structs.
```
  struct Attestation {
    uint256 attesterId;
    uint256 completedAt;
    uint256 stakeValue;
    uint256 expiresAt;
  }
  mapping(uint256 => Attestation[]) public attestations;
```
### AttesterId
Each entity participating in the process must have a Bloom Id in the *Account Registry* contract. The BloomId for the attester is stored in the attestation.
### SubjectId
The SubjectId is the key to the attestation. It does not need to be duplicated in the attestation struct.
### CompletedAt
The block timestamp from when the attestation was submitted is stored in the attestation.
### StakeValue
If an attestation has a non-zero stakeValue, the attester has collateralized tokens to vouch for the validity of the attestation. The stake can be revoked at any time and the tokens will be returned to the attester. There is currently no token penalty for revoking a stake early but it might negatively affect a user's Bloom Score.
### ExpiresAt
The block timestamp when the stake is to be considered expired. After the stake expires, the attester can withdraw their staked tokens.

## Attestation Repo Public Functions
### readAttestation
The only publicly available function in Attestation Repo is a getter to look up attestations by subjectId and attestationId. ReadAttestation only reveals the attestation data stored in the contract. The attestation event contains the data, trait types and other metadata that is not critical to the contract logic.
#### Interface
```
  function readAttestation(uint256 _subjectId, uint256 _attestationId) external view returns (
    uint256 _attesterId,
    uint256 _completedAt,
    uint256 _stakeValue,
    uint256 _expiresAt
  );
```
#### Example
```
// Solidity

  uint256 _attesterId;
  uint256 _completedAt;
  uint256 _stakeValue;
  uint256 _expiresAt;

  ( _attesterId,
    _completedAt,
    _stakeValue,
    _expiresAt
  ) = attestationRepo.readAttestation(
    _subjectId,
    _attestationId
  );

// Web3 Pseudocode
  accountRegistry = AccountRegistry.at("[address of registry contract]")
  userId = accountRegistry.accountIdForAddress.call(address)
  attestationRepo = AttestationRepo.at("[address of attestation repo contract]")
  attestationId = 0 | 1 | 2 ... (increments for each attestation)

  const recoveredAttestation = await attestationRepo.readAttestation.call(userId, 0)

  const [
    attesterId,
    completedAt,
    stakeValue,
    expiresAt
  ] = recoveredAttestation;
```
## Attestation Repo Restricted Functions
The ability to write a new attestation or revoke an attestation is restricted to the *Attestation Logic* contract.
### writeAttestation
Append a new attestation for a user and returns the attestationId.
#### Interface
```
  function writeAttestation(
    uint256 _subjectId,
    uint256 _attesterId,
    uint256 _timestamp,
    uint256 _stakeValue,
    uint256 _expiresAt
    ) external onlyAttestationLogic returns (uint256);
```
### revokeAttestation
Nullify the fields of an attestation so it may not be referenced as an active attestation. Leaves a hole in the attestations array. New attestations are appended after the nullified attestation.
#### Interface
```
  function revokeAttestation(uint256 _subjectId, uint256 _attestationId) external onlyAttestationLogic;
```
### writeStake
Modify the stake fields of an attestation. Currently this is used to zero out a stakeValue when tokens are reclaimed. In the future this could also be used to stake an existing attestation
Append a new attestation for a user and returns the attestationId.
#### Interface
```
  function writeStake(
    uint256 _subjectId,
    uint256 _attestationId,
    uint256 _stakeValue,
    uint256 _expiresAt
    ) external onlyAttestationLogic;
```
### transferTokensToStaker
During an active stake, *AttestationRepo* is the token holder of the collateralized tokens. Upon completion, *AttestationLogic* can request tokens to be transferred back to the staker.
#### Interface
```
  function transferTokensToStaker(
    address _staker,
    uint256 _value
    ) external onlyAttestationLogic;
```
# Attestation Logic
## Event Based Storage For Attestations
Event based storage is preferable to EVM state storage for variables not critical to the contract logic in order to save a significant amount of gas. Events are just as permanent as contract storage, they just cannot be referenced from within a transaction. Attestation data such as dataHash and requesterId are not critical to the logic of the contract. However they are critical to the Bloom Protocol. They are stored by emitting an event at the time of an attestation.
```
  event TraitAttested(
    uint256 attestationId,
    uint256 subjectId,
    uint256 attesterId,
    uint256 requesterId,
    bytes32 dataHash,
    uint256 stakeValue,
    uint256 expiresAt
    );
```
### DataHash
Attestations may reference a single type of identity data or a group of data. The dataHash stores a hash of the data that was shared with the attester.  The plaintext data itself is never stored on the blockchain. The data is formatted as follows:
```
[
 { 
  type: 'phone',
  data: '15551112323',
  nonce: '47b6cc5f-e961-4b9f-a675-6fafed394823'
 },
 {
  type: 'ssn',
  data: '012-34-5678',
  nonce: '328493defaf6-576a-f9b4-169e-f5cc6b75'
 },
 {
  type: 'attestation-types',
  data: 'phone, ssn',
  nonce: '328493defaf6-576a-f9b4-169e-f5cc6b75'
 }
]
```
Each component of the data is used to build a merkle tree. The root hash of the tree is the dataHash

If a 3rd party requests a Bloom user to reveal the data that was submitted as part of an attestation, the user can choose to reveal none, some or all of the data by sending the 3rd party the merkle proof and selected plaintext data.

### RequesterId, AttesterId & SubjectId
The entity requesting the attestation may be different from the user who is the subject of the attestation. Some 3rd party may be interested in a user having their name, phone number and address verified prior to offering them some service.

Each entity participating in the process must have a Bloom Id in the *Account Registry* contract. The BloomId for the requester and attester are stored in the attestation.

## Attestation Logic Public Functions
*Attestation Logic Logic* provides a public interface for Bloom and users to submit attestations to the *Attestation Repo*, revoke previous attestations, submit/ revoke stakes and reclaim tokens from expired stakes. As the Bloom protocol matures, this contract can be upgraded to enable new capabilities without needing to migrate the underlying storage contracts.
### attest
The attester calls attest to submit an attestation and receive payment from the requester.
A simplified view of the attestation process is:

	1. Requester is interested in having an attestation performed for a subject (Bloom user)
	2. Requester finds an attester willing to do the work for a set reward in BLT
	3. Requester obtains a signature from the subject authorizing the attestation
	4. Requester signs a signature authorizing the release of BLT to the attester upon completion of the attestation job.
	5. Attester attempts to verify data.
	6. If successful, attester writes attestation to the contract and receives payment. If unsuccesful, attester redeems payment signature for the full reward but does not write to the contract. (see contest)
#### Interface
```
  /**
   * @notice Function for attester to submit attestation from their own account
   * @dev Wrapper for attestForUser using msg.sender
   * @param _subject User this attestation is about
   * @param _requester User requesting and paying for this attestation in BLT
   * @param _reward Payment to attester from requester in BLT
   * @param _paymentNonce Nonce referenced in TokenEscrowMarketplace so payment sig can't be replayed
   * @param _requesterSig Signature authorizing payment from requester to attester
   * @param _dataHash Hash of data being attested and nonce
   * @param _requestNonce Nonce in sig signed by subject so it can't be replayed
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
    bytes _subjectSig,
  ) public
```
#### Example
```
	const attestationLogic = AttestationLogic.at("[attestation logic address]")
  // paymentNonce and requestNonce are random hex strings
  const signedAttestationAgreement = signAttestationRequest(
    subjectAddress,
    attesterAddress,
    requesterAddress,
    combinedDataHash,
    requestNonce,
    subjectPrivKey
  )
  const tokenReleaseSig = signTokenRelease(
    requesterAddress,
    attesterAddress,
    new BigNumber(web3.toWei(2, "ether")).toString(10), // ether used as a unit for conversion
    paymentNonce,
    requesterPrivKey
  )
	
	attestationLogic.attest(
    subjectAddress,
    requesterAddress,
    new BigNumber(web3.toWei(2, "ether")),
    paymentNonce,
    tokenReleaseSig,
    combinedDataHash,
    requestNonce,
    signedAttestationAgreement,
    {from: attesterAddress}
  )
```

### revokeAttestation
The subject, attester or contract admin can revoke attestations. Revoking an attestation simply means nulling the fields of the attestation so when the current state of the contract is queried, it is not considered active. In future versions of this contract, revoking attestations may have additional restrictions.
#### Interface
```
  /**
   * @notice Revoke an attestation by the subject, attester or the admin
   * @param _subjectId user this attestation is about
   * @param _attestationId Id of the attestation to revoke
   */
  function revokeAttestation(
    uint256 _subjectId,
    uint256 _attestationId
    ) public;
```
#### Example
```
  accountRegistry = AccountRegistry.at("[address of registry contract]")
  userId = accountRegistry.accountIdForAddress.call(address)
  attestationLogic = AttestationLogic.at("[address of attestation logic contract]")
  attestationId = 0 | 1 | 2 ... (increments for each attestation)

  attestationLogic.revokeAttestation(
    subjectId, 
    attestationId,
    {from: subject | attester | owner}
    )
```

### contest
The attester calls contest to redeem payment for a failed attestation without leaving a permanent negative record associated with a user's BloomID.
#### Interface
```
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
  ) public;
```
#### Example
```
  const attestationLogic = AttestationLogic.at("[attestation logic address]")
  // paymentNonce and requestNonce are random hex strings
  const signedAttestationAgreement = signAttestationRequest(
    subjectAddress,
    attesterAddress,
    requesterAddress,
    combinedDataHash,
    requestNonce,
    subjectPrivKey
  )
  const tokenReleaseSig = signTokenRelease(
    requesterAddress,
    attesterAddress,
    new BigNumber(web3.toWei(2, "ether")).toString(10), // ether used as a unit for conversion
    paymentNonce,
    requesterPrivKey
  )
	
	attestationLogic.contest(
    requesterAddress,
    new BigNumber(web3.toWei(2, "ether")),
    paymentNonce,
    tokenReleaseSig,
    {from: attesterAddress}
  )
```

### stake
A user can submit a staked attestation in which they lock up BLT for a specified amount of time in order to vouch for the validity of an attestation. Currently staked attestations are used for peer staking in which someone can vouch for a friend's creditworthiness.
#### Interface
```
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
  ) public;
```
#### Example
```
  const attestationLogic = AttestationLogic.at("[attestation logic address]")
  // paymentNonce and requestNonce are random hex strings
  const signedAttestationAgreement = signAttestationRequest(
    subjectAddress,
    stakerAddress,
    stakerAddress,
    combinedDataHash,
    requestNonce,
    subjectPrivKey
  )

  const tokenReleaseSig = signTokenRelease(
    stakerAddress,
    attestationRepoAddress,
    new BigNumber(web3.toWei(2, "ether")).toString(10), // ether used as a unit for conversion
    paymentNonce,
    stakerPrivKey
  )

  const stakeDuration = 60 * 60 * 24 * 90 // 90 days

  attestationLogic.stake(
    subjectAddress,
    new BigNumber(web3.toWei(2, "ether")),
    paymentNonce,
    tokenReleaseSig,
    combinedDataHash,
    requestNonce,
    signedAttestationAgreement,
    stakeDuration,
    {from: attesterAddress}
  )
```

### reclaimStakedTokens
After a staking period has ended, a user can reclaim their tokens by calling reclaimStakedTokens.
#### Interface
```
  /**
   * @notice Reclaim staked tokens for an expired stake
   * @param _subjectId User who is subject of attestation and of stake
   * @param _attestationId Id of attestation in attestationRepo
   */
  function reclaimStakedTokens(
    uint256 _attestationId,
    uint256 _subjectId
    ) public;
```
#### Example
```
  const attestationLogic = AttestationLogic.at("[attestation logic address]")
  // paymentNonce and requestNonce are random hex strings
  const signedAttestationAgreement = signAttestationRequest(
    subjectAddress,
    stakerAddress,
    stakerAddress,
    combinedDataHash,
    requestNonce,
    subjectPrivKey
  )

  const tokenReleaseSig = signTokenRelease(
    stakerAddress,
    attestationRepoAddress,
    new BigNumber(web3.toWei(2, "ether")).toString(10), // ether used as a unit for conversion
    paymentNonce,
    stakerPrivKey
  )

  const stakeDuration = 60 * 60 * 24 * 90 // 90 days

  attestationLogic.stake(
    subjectAddress,
    new BigNumber(web3.toWei(2, "ether")),
    paymentNonce,
    tokenReleaseSig,
    combinedDataHash,
    requestNonce,
    signedAttestationAgreement,
    stakeDuration,
    {from: attesterAddress}
  )
  
  // 90 days pass

  attestationLogic.reclaimStakedTokens(attestationId, subjectId)
```

### revokeStake
During a staking period, a staker can revoke their stake and reclaim all of their tokens at any time. There is currently no penalty for revoking a stake early.
#### Interface
```
  /**
   * @notice End a stake early and reclaim tokens
   * @param _subjectId User who is subject of attestation and of stake
   * @param _attestationId Id of attestation in attestationRepo
   */
  function revokeStake(
    uint256 _attestationId,
    uint256 _subjectId
    ) public;
```
#### Example
```
  const attestationLogic = AttestationLogic.at("[attestation logic address]")
  // paymentNonce and requestNonce are random hex strings
  const signedAttestationAgreement = signAttestationRequest(
    subjectAddress,
    stakerAddress,
    stakerAddress,
    combinedDataHash,
    requestNonce,
    subjectPrivKey
  )

  const tokenReleaseSig = signTokenRelease(
    stakerAddress,
    attestationRepoAddress,
    new BigNumber(web3.toWei(2, "ether")).toString(10), // ether used as a unit for conversion
    paymentNonce,
    stakerPrivKey
  )

  const stakeDuration = 60 * 60 * 24 * 90 // 90 days

  attestationLogic.stake(
    subjectAddress,
    new BigNumber(web3.toWei(2, "ether")),
    paymentNonce,
    tokenReleaseSig,
    combinedDataHash,
    [3],
    requestNonce,
    signedAttestationAgreement,
    stakeDuration,
    {from: attesterAddress}
  )
  
  // any time before stake period ends

  attestationLogic.revokeStake(attestationId, subjectId)
```

## Attestation Logic Admin Functions
Bloom has administrative privileges to submit delegated transactions for user and configure the external contracts. 

### attestFor
Users can delegate certain protocol actions to the Bloom admin in order to have Bloom pays the transaction costs, as described in *Signing Logic*. An attester can collect all the signatures and data necessary for an attestation, sign them, then send the transaction information to Bloom to submit to the contract.
The nonces are included in the signature to make these signatures single-use. The contract maintains a mapping of used signatures.
`mapping (bytes32 => bool) public usedSignatures;`

#### Interface
```
  function attestFor(
    address _subject,
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig,
    bytes32 _dataHash,
    bytes32 _requestNonce,
    bytes _subjectSig,
    bytes _delegationSig
  ) public onlyOwner
```
#### Signing Logic
```
  bytes32 constant ATTEST_FOR_TYPEHASH = keccak256(
    "AttestFor(address subject,address requester,uint256 reward,bytes32 paymentNonce,bytes32 dataHash,bytes32 requestNonce)"
  );
  struct AttestFor {
      address subject;
      address requester;
      uint256 reward;
      bytes32 paymentNonce;
      bytes32 dataHash;
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
      request.requestNonce
    ));
  }
  function generateAttestForDelegationSchemaHash(
    address _subject,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
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
          _requestNonce
        ))
      )
      );
  }
```

### contestFor
#### Interface
```
  function contestFor(
    address _attester,
    address _requester,
    uint256 _reward,
    bytes32 _paymentNonce,
    bytes _requesterSig,
    bytes _delegationSig
  ) public onlyOwner;
```
#### Signing Logic
```
  bytes32 constant CONTEST_FOR_TYPEHASH = keccak256(
    "ContestFor(address requester,uint256 reward,bytes32 paymentNonce)"
  );
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
```

### stakeFor
#### Interface
```
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
  ) public onlyOwner;
```
#### Signing Logic
```
  bytes32 constant STAKE_FOR_TYPEHASH = keccak256(
    "StakeFor(address subject,uint256 value,bytes32 paymentNonce,bytes32 dataHash,bytes32 requestNonce,uint256 stakeDuration)"
  );
  struct StakeFor {
      address subject;
      uint256 value;
      bytes32 paymentNonce;
      bytes32 dataHash;
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
      request.requestNonce,
      request.stakeDuration
    ));
  }
  function generateStakeForDelegationSchemaHash(
    address _subject,
    uint256 _value,
    bytes32 _paymentNonce,
    bytes32 _dataHash,
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
          _requestNonce,
          _stakeDuration
        ))
      )
      );
  }
```

### revokeStakeFor
#### Interface
```
  function revokeStakeFor(
    uint256 _subjectId,
    address _staker,
    uint256 _attestationId,
    bytes _delegationSig
  ) public onlyOwner;
```
#### Signing Logic
```
  bytes32 constant REVOKE_STAKE_FOR_TYPEHASH = keccak256(
    "RevokeStakeFor(uint256 subjectId,uint256 attestationId)"
  );
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
```

### Configure External Contracts
Bloom can configure the external contracts associated with *Attestation Logic* in order to upgrade components as standards change and the protocol matures. The configurable external contracts include:
	* Account Registry
	* Attestation Repo
	* Signing Logic
	* Token Escrow Marketplace
## Events
*Attestation Logic* emits events when attestations are completed when the contract configuration changes.
```
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
  event AttestationRevoked(uint256 indexed subjectId, uint256 attestationId, uint256 indexed revokerId);
  event StakeSubmitted(uint256 indexed subjectId, uint256 indexed stakerId, uint256 attestationId, uint256 expiresAt);
  event StakedTokensReclaimed(uint256 indexed stakerId, uint256 value);
  event AccountRegistryChanged(address oldRegistry, address newRegistry);
  event AttestationRepoChanged(address oldAttestationRepo, address newAttestationRepo);
  event SigningLogicChanged(address oldSigningLogic, address newSigningLogic);
  event TokenEscrowMarketplaceChanged(address oldTokenEscrowMarketplace, address newTokenEscrowMarketplace);
  event AdminChanged(address oldAdmin, address newAdmin);
```

# Token Escrow Marketplace
TokenEscrowMarketplace is an ERC20 payment channel that enables users to send BLT by exchanging signatures off-chain. Users approve the contract address to transfer BLT on their behalf using the standard `ERC20.approve` function. After approval, either the user or the contract admin initiates the transfer of BLT into the contract. BLT balances are stored in the contract by accountId. The accountIds are managed by the *Account Registry* contract.
Once in the contract, users can send payments via signed message to another user. The signature transfers BLT from lockup to the recipient's wallet. Users can withdraw funds at any time. Or the admin can release them on the owner's behalf.
Only the *Attestation Logic* contract is authorized to release funds using a payment signature upon completion of a job.


## Token Escrow Marketplace Data Structures
Each user has their spendable token balance stored within the marketplace contract, `tokenEscrow`. Users can retrieve these tokens at any point by calling `withdrawTokens` from an address associated with their BloomId, or requesting the contract admin to withdraw the tokens on their behalf.
```
mapping(uint256 => uint256) public tokenEscrow.
```
## Token Escrow Marketplace Public Functions
*Token Escrow Marketplace* provides a public interface for users to manage the BLT they pay or receive to participate in the Identity Attestation process. Users may deposit and withdraw tokens. Bloom may also perform these actions on a user’s behalf in order to pay the transaction costs. All actions require a signature from the user authorizing the action.
### moveTokensToEscrowLockup
Move tokens from the user to `tokenEscrow` . Must be preceeded by an ERC20 Approve function authorizing the transfer of tokens into the contract.
#### Interface
```
  function moveTokensToEscrowLockup(uint256 _amount) public
```
#### Example
```
const tokenEscrowMarketplace = TokenEscrowMarketplace.at([Marketplace contract address])
token.approve(tokenEscrowMarketplace.address, new BigNumber("100e18"));
tokenEscrowMarketplace.moveTokensToEscrowLockup(
  new BigNumber("100e18"),
  {from: Bloom Id address}
)
```
### releaseTokensFromEscrow
Transfer tokens back to user.
#### Interface
```
  function releaseTokensFromEscrow(uint256 _amount) public
```
#### Example
```
const tokenEscrowMarketplace = TokenEscrowMarketplace.at([Marketplace contract address])
tokenEscrowMarketplace.releaseTokensFromEscrow(
  new BigNumber("10e18"),
  {from: Bloom Id address}
```

## Token Escrow Marketplace Payment
A Bloom user who has locked up tokens in `tokenEscrow` may send a signed payment authorization signature to another Bloom user. This signatures is submitted to *Attestation Logic* upon completion of an attestation job. If the attestation is successfully written to *Attestation Repo*, the tokens are released from `tokenEscrow` and transfered to the recipient. Only the specified *Attestation Logic* contract can move locked up tokens from `tokenEscrow` to a recipient’s `tokenBalances`. 
See the `attest` example to see how the payment signature is formed and submitted.

## Token Escrow Marketplace Admin Functions
Users can delegate certain *Token Escrow Marketplace* actions to the Bloom admin in order to avoid paying transaction costs. The Bloom admin can also configure the external contracts associated with the marketplace contract.
### moveTokensToEscrowLockupFor
Deposit tokens on behalf of a user.
This action requires a specific one-time-use signature from a user authorizing the tokens to be locked up.
The nonce in the signature to make these signatures single-use. The contract maintains a mapping of used signatures.
`mapping (bytes32 => bool) public usedSignatures;`
#### Interface
```
  /**
   * @notice Lockup tokens for set time period on behalf of user. Must be preceded by deposit into contract
   * @param _sender User locking up their tokens
   * @param _amount Tokens to lock up
   * @param _lockupDuration Time until tokens will be withdrawable. Max 1 year
   * @param _nonce Random hex string used when generating sigs to make them one time use
   * @param _delegationSig Signed hash of these input parameters so admin can submit this on behalf of a user
   */
  function moveTokensToEscrowLockupFor(
    address _sender,
    uint256 _amount,
    uint256 _lockupDuration,
    bytes32 _nonce,
    bytes _delegationSig
    ) public onlyMarketplaceAdmin
```
#### Signing Logic
```
  bytes32 constant LOCKUP_TOKENS_FOR = keccak256(
    "LockupTokensFor(address sender,uint256 amount,bytes32 nonce)"
  );
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

```
### releaseTokensFromEscrowLockupFor
Release tokens from `tokenEscrow` and transfer back to the owner.
#### Interface
```
  /**
   * @notice Release tokens back to payer's available balance if lockup expires
   * @dev Token balance retreived by accountId. Can be different address from the one that deposited tokens
   * @param _payer User retreiving tokens from escrow
   * @param _amount Tokens to retreive from escrow
   */
  function releaseTokensFromEscrowFor(address _payer, uint256 _amount) public onlyMarketplaceAdmin
```
### Configure External Contracts
Bloom can configure the external contracts associated with *Token Escrow Marketplace* in order to upgrade components as standards change and the protocol matures. The configurable external contracts include:
	* Account Registry
	* Attestation Logic
	* Signing Logic
## Events
*Token Escrow Marketplace* emits events when tokens are deposits, withdrawn or moved within the marketplace. Events are also emitted when the contract configuration changes
```
  event TokenMarketplaceWithdrawal(uint256 subject, uint256 amount);
  event TokenMarketplaceEscrowPayment(uint256 escrowPayer, address escrowPayee, uint256 amount);
  event TokenMarketplaceDeposit(uint256 escrowPayer, uint256 amount);
  event SigningLogicChanged(address oldSigningLogic, address newSigningLogic);
  event AttestationLogicChanged(address oldAttestationLogic, address newAttestationLogic);
  event AccountRegistryChanged(address oldRegistry, address newRegistry);
  event MarketplaceAdminChanged(address oldMarketplaceAdmin, address newMarketplaceAdmin);
```

# Poll
Bloom’s protocol heavily relies on community voting to make important protocol decisions. Anyone can create a Poll in the Bloom network by interacting with the VotingCenter contract. You don’t have to have a Bloom account to *create* a poll, but the dApp will likely filter the polls it displays to include polls created by community members.
Votes are associated with Bloom Ids. If a user has multiple addresses associated with their Bloom Id, their total BLT balance across all addresses will be used to tally their influence.
If Alice wanted to create a very simple poll within the Bloom network, it might look like this:
```
// This module exists in the repo!
const ipfsUtils = require(“./src/ipfs”);

// Related contracts
accountRegistry = AccountRegistry.at("[address of registry contract]")
signingLogic = SigningLogic.at("[address of signing logic contract"])

// Create a connection to IFPS
const IPFS = require(“ipfs-mini”);
const ipfs = new IPFS({
  host: “ipfs.infura.io”,
  port: 5001,
  protocol: “https”
});

// Poll data we want to store
const poll = {
  title: “What kind of ice cream should I buy?”,
  description: “I am hosting a party soon and I need to decide!”,
  choices: [“Vanilla”, “Chocolate”, “Strawberry”]
};

// Write the data to IPFS
ipfs.addJSON(poll, (err, ipfsMultihash) => {
  if (err) throw err;

  // On success, create the poll via the voting center
  votingCenter.createPoll(
    ipfsUtils.toHex(ipfsMultihash),
    poll.choices.length,
    +new Date() / 1000 + 60 * 5, // start in 5 minutes
    +new Date() / 1000 + 60 * 60 * 24 * 7 // end the poll in 1 week,
    accountRegistry.address,
    signingLogic.address
  );
});
```
## Delegated Voting
A designed poll admin can submit votes on behalf of users in order to pay the transaction costs. A user signs a one-time-use signature with the vote information and sends it to the poll admin to vote on their behalf. A nonce is included in the signature to make each vote unique.
`  mapping (bytes32 => bool) public usedSignatures;`

#### Interface
```
  function voteFor(uint16 _choice, address _voter, bytes32 _nonce, bytes _delegationSig) external onlyPollAdmin
```
#### Signing Logic
```
  bytes32 public constant voteForSchemaHash =
    keccak256(
      abi.encodePacked(
        "uint16 choice",
        "address voter",
        "bytes32 nonce",
        "address poll"
      )
  );

  function generateVoteForDelegationSchemaHash(
    uint16 _choice,
    address _voter,
    bytes32 _nonce,
    address _poll
  ) external view returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        voteForSchemaHash,
        keccak256(
          abi.encodePacked(
            _choice,
            _voter,
            _nonce,
            _poll
          )
        )
      )
    );
  }
```
 
