These contracts are documented on Bloom's website here: https://bloom.co/docs

The documentation is also available in the readme below.

# Contract Summaries

**Accounts**

Anyone can use the Bloom Protocol smart contracts using any address. Bloom supports regular EOA addresses or smart contracts like multisigs. The AccountRegistryLogic contract enables users to demonstrate ownership of multiple addresses by linking the addresses on chain.

**Signing Logic**

Bloom relies on the signTypedData proposal described in EIP712 for many protocol interactions including allowing users to delegate transactions to Bloom to pay transaction costs. The SigningLogic contract contains all of the logic to recover addresses from signTypedData signatures.

**Attestations**

One of the core components of Bloom protocol is Attestations. The attestation contract enables users to build a collection of verified information they can use to sign up for third party services.

**Accreditation**

Bloom maintains a whitelist of accredited data verifiers via an Accreditation Repo. Currently Bloom retains the rights to grant and revoke accreditation. In the future this contract can be upgraded to enable community voting based accreditation.

**Token Escrow** 

Users can lock up BLT in the Token Escrow contract. Once locked up users can send micropayments to other users by signing payment authorizations. Payments are redeemed by completing attestations.

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
nonce = sha3(uuid())

newAddressLinkSig = ethSigUtil.signTypedData(unclaimedPrivkey, {
  data: getFormattedTypedDataAddAddress(registryLogicAddress, 1, alice, nonce)
})

currentAddressLinkSig = ethSigUtil.signTypedData(alicePrivkey, {
  data: getFormattedTypedDataAddAddress(registryLogicAddress, 1, unclaimed, nonce)
})

registryLogic.linkAddresses(alice, currentAddressLinkSig, unclaimed, newAddressLinkSig, nonce, {from: anyone})
```

### unlinkAddress
Remove an address from a link relationship to another address. An address can only be unlinked if authorized by the a message signed by the associated private key. A user can submit this transaction from their own address or it can be submitted by a third party on their behalf.

#### Interface
```
  function unlinkAddress(
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
nonce = sha3(uuid())

await registryLogic.linkAddresses(alice, currentAddressLinkSig, unclaimed, newAddressLinkSig, nonceHash, { from: bob })
const unlinkSig = ethSigUtil.signTypedData(unclaimedPrivkey, {
  data: getFormattedTypedDataRemoveAddress(registryLogicAddress, 1, unclaimed, nonceHash)
})
await registryLogic.unlinkAddress(
  unclaimed,
  nonceHash,
  unlinkSig,
  { from: bob }
)

```

# Signing Logic
Bloom relies on the `signTypedData` proposal described in EIP712 for many protocol interactions including allowing users to delegate transactions to Bloom to pay transaction costs. SigningLogic implements all of the EIP712 schemas for the Bloom Protocol contracts. It also implements utility functions to manage signatures and recover signers. SigningLogic is inherited by the other Bloom Protocol contracts.

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
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );

  bytes32 DOMAIN_SEPARATOR = hash(EIP712Domain({
      name: "Bloom",
      version: '1',
    }));

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

  constructor (string name, string version, uint256 chainId) public {
    DOMAIN_SEPARATOR = hash(EIP712Domain({
      name: name,
      version: version,
      chainId: chainId,
      verifyingContract: this
    }));
  }
```

## Burning Signatures
Each signature containing an authorization for a delegated Bloom Protocol action is single use. The schema contains a nonce to make each signature unique even if the intended actionis the same. SigningLogic maintains a list of signatures that have been used and reverts if a signature is submitted more than once.

```
  mapping (bytes32 => bool) public usedSignatures;

  function burnSignature(bytes _signature) internal {
    bytes32 _signatureHash = keccak256(abi.encodePacked(_signature));
    require(!usedSignatures[_signatureHash], "Signature not unique");
    usedSignatures[_signatureHash] = true;
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
nonce = sha3(uuid())

newAddressLinkSig = ethSigUtil.signTypedData(unclaimedPrivkey, {
  data: getFormattedTypedDataAddAddress(registryLogicAddress, 1, alice, nonce)
})

currentAddressLinkSig = ethSigUtil.signTypedData(alicePrivkey, {
  data: getFormattedTypedDataAddAddress(registryLogicAddress, 1, unclaimed, nonce)
})
```

# Attestation Logic
AttestationLogic allows attesters to receive payment for completing authorizations when requested by a third party and only when authorized by the subject. Requesters, attesters and subjects coordinate off-chain to verify identity information. Attesters publish their decision on chain by either 'attesting' the information or 'contesting' it. Either way they receive payment from the requester's escrow account. Users can also revoke attestations through the AttestationLogic contract by emitting a revoke event referencing the revocation links contained in the attestation data tree.

## Event Based Storage For Attestations
Event based storage is preferable to EVM state storage for variables not critical to the contract logic in order to save a significant amount of gas. Events are just as permanent as contract storage, they just cannot be referenced from within a transaction. Attestation data such as dataHash and requesterId are not critical to the logic of the contract. However they are critical to the Bloom Protocol. They are stored by emitting an event at the time of an attestation.
```
  event TraitAttested(
    address subject,
    address attester,
    address requester,
    bytes32 dataHash
    );
```

### DataHash
Attestations may reference a single type of identity data or a group of data. The dataHash stores the root of the attestation data Merkle tree.  The plaintext data itself is never stored on the blockchain. See the [attestations-lib](https://github.com/hellobloom/attestations-lib) for more information on how the dataHash is formed.

If a 3rd party requests a Bloom user to reveal the data that was submitted as part of an attestation, the user can choose to reveal none, some or all of the data by sending the 3rd party the merkle proof and selected plaintext data.

### RequesterId, AttesterId & SubjectId
The entity requesting the attestation may be different from the user who is the subject of the attestation. Some 3rd party may be interested in a user having their name, phone number and address verified prior to offering them some service.

## Attestation Logic Public Functions
*Attestation Logic* provides a public interface for Bloom and users to submit attestations, receive payment and revoke previous attestations.

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
   * @notice Function for attester to submit attestation from their own account) 
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
    bytes _subjectSig
  ) public;
```

#### Example
```
	const attestationLogic = AttestationLogic.at("0x132...")

  const subjectSig = ethSigUtil.signTypedData(alicePrivkey, {
    data: getFormattedTypedDataAttestationRequest(attestationLogicAddress, 1, combinedDataHash, nonce)
  })
  const tokenPaymentSig = ethSigUtil.signTypedData(davidPrivkey, {
    data: getFormattedTypedDataPayTokens(
      tokenEscrowMarketplaceAddress,
      1,
      david,
      bob,
      new BigNumber(1e17).toString(10),
      nonce
    )
  })

  await attestationLogic.attest(alice, david, new BigNumber(1e17), paymentNonce, tokenPaymentSig, dataHash, requestNonce, subjectSig, {
    from: bob)
```

### revokeAttestation
An attestation can be revoked by submitting a `revokeAttestation` transaction containing the revocationLink string embeeded in the attestation data tree.
#### Interface
```
  /**
   * @notice Revoke an attestation
   * @dev Link is included in dataHash and cannot be directly connected to a BloomID
   * @param _link bytes string embedded in dataHash to link revocation
   */
  function revokeAttestation(
    bytes32 _link
    ) public;
```
#### Example
```
  const revokeLink = "0xb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6"

  await attestationLogic.revokeAttestation(revokeLink, {
    from: bob
  })
```

### contest
The attester calls contest to redeem payment for a failed attestation without leaving a permanent negative record associated with a user's BloomID.
#### Interface
```
  /**
   * @notice Function for attester to reject an attestation and receive payment 
   *  without associating the negative attestation with the subject
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
	const attestationLogic = AttestationLogic.at("0x132...")

  const subjectSig = ethSigUtil.signTypedData(alicePrivkey, {
    data: getFormattedTypedDataAttestationRequest(attestationLogicAddress, 1, combinedDataHash, nonce)
  })
  const tokenPaymentSig = ethSigUtil.signTypedData(davidPrivkey, {
    data: getFormattedTypedDataPayTokens(
      tokenEscrowMarketplaceAddress,
      1,
      david,
      bob,
      new BigNumber(1e17).toString(10),
      paymentNonce
    )
  })

  await attestationLogic.contest(
    david,
    new BigNumber(1e17),
    paymentNonce,
    tokenPaymentSig,
    {from: attesterAddress}
  )
```

## Attestation Logic Delegated Transactions
Anyone can collect valid attestation signatures and submit the transaction on behalf of the attester in order to pay transaction fees.

### attestFor

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
    bytes _subjectSig, // Sig of subject with dataHash and requestNonce
    bytes _delegationSig
  ) public;
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
  ) public;
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

### Migration
The deployer can specify an `initializer` address which has the privileges to write attestations to this contract without signature authorization during a data migration period. This privilege is revoked once initialization ends.

#### Interface
```
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
  ) public onlyDuringInitialization;
```

# Token Escrow Marketplace
TokenEscrowMarketplace is an ERC20 escrow contract that enables users to send BLT by exchanging signatures off-chain. Users approve the contract address to transfer BLT on their behalf using the standard `ERC20.approve` function. After approval, either the user or the contract admin initiates the transfer of BLT into the contract. BLT balances are stored in the contract by address. Users should store BLT with the same address they will use to request and pay for attestations.

Once in the contract, users can send payments via signed message to another user. The signature transfers BLT from lockup to the recipient's wallet. Users can withdraw unused funds at any time.

Only the *Attestation Logic* contract is authorized to release funds to a third party using a payment signature upon completion of a job.


## Token Escrow Marketplace Data Structures
Each user has their spendable token balance stored within the marketplace contract, `tokenEscrow`. Users can retrieve these tokens at any point by calling `releaseTokensFromEscrow` or signing the intention to withdraw and having a third party submit the transaction on their behalf.
```
mapping(address => uint256) public tokenEscrow.
```
## Token Escrow Marketplace Functions
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
tokenEscrowMarketplace.moveTokensToEscrowLockup(new BigNumber("100e18"))
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
tokenEscrowMarketplace.releaseTokensFromEscrow(new BigNumber("10e18"))
```

## Token Escrow Marketplace Payment
A Bloom user who has locked up tokens in `tokenEscrow` may send a signed payment authorization signature to another Bloom user. This signatures is submitted to *Attestation Logic* upon completion of an attestation job. If the attestation is successfully written to *Attestation Repo*, the tokens are released from `tokenEscrow` and transfered to the recipient. Only the specified *Attestation Logic* contract can transfer locked up tokens from `tokenEscrow` to a recipient. 
See the `attest` example to see how the payment signature is formed and submitted.

## Token Escrow Marketplace Delegated Functions
Users can delegate certain *Token Escrow Marketplace* actions to the Bloom admin in order to avoid paying transaction costs. The Bloom admin can also configure the external contracts associated with the marketplace contract.
### moveTokensToEscrowLockupFor
Deposit tokens on behalf of a user.
This action requires a specific one-time-use signature from a user authorizing the tokens to be locked up.
#### Interface
```
  /**
   * @notice Lockup tokens for set time period on behalf of user. Must be preceded by deposit into contract
   * @param _sender User locking up their tokens
   * @param _amount Tokens to lock up
   * @param _nonce Random hex string used when generating sigs to make them one time use
   * @param _delegationSig Signed hash of these input parameters so admin can submit this on behalf of a user
   */
  function moveTokensToEscrowLockupFor(
    address _sender,
    uint256 _amount,
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
   * @notice Withdraw tokens from escrow back to requester
   * @dev Authorized by a signTypedData signature by sender
   *  Sigs can only be used once. They contain a unique nonce
   *  So an action can be repeated, with a different signature
   * @param _sender User locking up their tokens
   * @param _amount Tokens to lock up
   * @param _nonce Unique Id so signatures can't be replayed
   * @param _delegationSig Signed hash of these input parameters so an admin can submit this on behalf of a user
   */
  function releaseTokensFromEscrowFor(
    address _sender,
    uint256 _amount,
    bytes32 _nonce,
    bytes _delegationSig
    ) public;
```


# Poll
Bloom’s protocol heavily relies on community voting to make important protocol decisions. Anyone can create a Poll in the Bloom network by interacting with the VotingCenter contract. You don’t have to have a Bloom account to *create* a poll, but the dApp will likely filter the polls it displays to include polls created by community members.
Votes are associated with addresses. If a user has multiple addresses linked together, their total BLT balance across all addresses will be used to tally their influence.
If Alice wanted to create a very simple poll within the Bloom network, it might look like this:
```
// This module exists in the repo!
const ipfsUtils = require(“./src/ipfs”);

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

const chainId = 1; // mainnet

// Write the data to IPFS
ipfs.addJSON(poll, (err, ipfsMultihash) => {
  if (err) throw err;

  // On success, create the poll via the voting center
  votingCenter.createPoll(
    "Ice cream poll",
    chainid,
    ipfsUtils.toHex(ipfsMultihash),
    poll.choices.length,
    +new Date() / 1000 + 60 * 5, // start in 5 minutes
    +new Date() / 1000 + 60 * 60 * 24 * 7 // end the poll in 1 week
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
 
