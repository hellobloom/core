These contracts are documented on Bloom's website here: https://bloom.co/docs

The documentation is also available in the readme below.

# Contract Summaries

**Accounts**

AccountRegistry associates Ethereum addresses with BloomIDs. Users authorize transactions within the Bloom protocol using addresses they associate with their BloomID. Users can associate multiple addresses with their BloomID.

**Signing Logic**

Bloom relies on the signTypedData proposal described in EIP712 for many protocol interactions including allowing users to delegate transactions to Bloom to pay transaction costs. The SigningLogic contract contains all of the logic to recover addresses from signTypedData signatures.

**Attestations**

One of the core components of Bloom protocol is Identity Attestations. The attestations contracts enable users to securely associate verified identity information with their BloomID in order to strengthen their profile.

Users can stake a specified amount of BLT on the validity of an attestation. A stake is valid for a specified amount of time. After the stake period, users can reclaim the BLT they staked. Stakes can be revoked at any time without penalty. This may change in the future.

**Accreditation**

Bloom maintains a whitelist of accredited data verifiers via an Accreditation Repo. Currently Bloom retains the rights to grant and revoke accreditation. In the future this contract can be upgraded to enable community voting based accreditation.

**Token Escrow** 

Users can lock up BLT in the Token Escrow contract. Once locked up users can send micropayments to other users by signing payment authorizations with an address associated with their BloomID.

**Voting**

Bloom’s protocol heavily relies on community voting to make important protocol decisions. Anyone can create a Poll in the Bloom network by interacting with the VotingCenter contract.

# Getting Started

1. Clone the repository
2. Run `yarn install` to install dependencies
3. Copy `truffle.js.example` to `truffle.js`
4. Compile contract typings `./bin/compile-typings`
5. Run tests with `./bin/test`

## Making Changes

The tests are written in Typescript. If you make changes to the contracts which impact the ABI, update the typings with:

`./bin/compile-typings --reset`

The tests are in the `ts_test` folder. They are separated by contract. Each test follows the same basic structure.

1. Load the contract and the relevant interfaces
2. Import the test-rpc accounts
3. Initialize the accounts with properties relevant to the contract (create accounts, gift them tokens, etc)
4. Test each contract function

## Explanation of Compiler Warnings

The following compiler warnings will be presented when compiling with solc v0.4.24

```
Compilation warnings encountered:

// Outdated constructor in oppenzeppelin-solidity module
openzeppelin-solidity/contracts/ownership/Ownable.sol:20:3: Warning: Defining constructors as functions with the same name as the contract is deprecated. Use "constructor(...) { ... }" instead.
  function Ownable() public {
  ^ (Relevant source part starts here and spans across multiple lines).
,openzeppelin-solidity/contracts/ownership/HasNoEther.sol:25:3: Warning: Defining constructors as functions with the same name as the contract is deprecated. Use "constructor(...) { ... }" instead.
  function HasNoEther() public payable {
  ^ (Relevant source part starts here and spans across multiple lines).

// Interface is being used to define consistent function format in the event of upgraded contract internals
// These functions are used both internally by AccountRegistry and externally so they are defined public, not external
,/Users/.../core-private-audit/contracts/AccountRegistryInterface.sol:4:3: Warning: Functions in interfaces should be declared external.
  function accountIdForAddress(address _address) public view returns (uint256);
  ^---------------------------------------------------------------------------^
,/Users/.../core-private-audit/contracts/AccountRegistryInterface.sol:5:3: Warning: Functions in interfaces should be declared external.
  function accountTypeForAddress(address _address) public view returns (uint256);
  ^-----------------------------------------------------------------------------^
,/Users/.../core-private-audit/contracts/AccountRegistryInterface.sol:6:3: Warning: Functions in interfaces should be declared external.
  function addressBelongsToAccount(address _address) public view returns (bool);
  ^----------------------------------------------------------------------------^
```

## 3rd Party Contract Dependencies
|File|Dependencies|Description|
|---|---|---|
|AccountRegistry.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AccountRegistryLogic.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AttestationRepo.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AttestationRepo.sol|open-zeppelin#Pausable|This contract holds collateralized tokens so it should be able to be paused if a vulnerability is discovered|
|AttestationRepo.sol|open-zeppelin#SafeERC20|Wrapper for ERC20 methods that throw on failure|
|AttestationRepo.sol|open-zeppelin#ERC20|ERC20 methods to enable this contract to interact with BLT|
|AccreditationRepo.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AirdropProxy.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AirdropProxy.sol|open-zeppelin#Pausable|This contract holds collateralized tokens so it should be able to be paused if a vulnerability is discovered|
|AirdropProxy.sol|open-zeppelin#SafeERC20|Wrapper for ERC20 methods that throw on failure|
|AirdropProxy.sol|open-zeppelin#ERC20|ERC20 methods to enable this contract to interact with BLT|
|AirdropProxy.sol|open-zeppelin#HasNoEther|Enables owner to retrieve eth from this contract and attempts to stop eth from being deposited|
|AttestationLogic.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|AttestationLogicUpgradeMode.sol|open-zeppelin#Ownable|Owner can write to AttestationRepo when in upgrade mode|
|SigningLogic.sol|open-zeppelin#ECRecovery|ECRecovery.recover is used for all delegated transactions and other interactions requiring a signature from the user|
|TokenEscrowMarketplace.sol|open-zeppelin#Ownable|Owner can update interface contracts|
|TokenEscrowMarketplace.sol|open-zeppelin#Pausable|This contract holds escrow tokens so it should be able to be paused if a vulnerability is discovered|
|TokenEscrowMarketplace.sol|open-zeppelin#SafeERC20|Wrapper for ERC20 methods that throw on failure|
|TokenEscrowMarketplace.sol|open-zeppelin#ERC20|ERC20 methods to enable this contract to interact with BLT|
|TokenEscrowMarketplace.sol|open-zeppelin#SafeMath|Safety checks for math operations to manipulate escrow balances|


# Design Patterns
## Storage & Logic Contracts
Storage contracts store the data associated with BloomID accounts and attestations. The contracts implement basic read/ write functionality but delegate all protocol logic to external logic contracts. As the Bloom protocol matures, the logic contracts can be upgraded without having to migrate and rewrite all of the stored data. This design pattern is implemented in:

|Storage Contract|Logic Contract|
|---|---|
|Attestation Repo|Attestation Logic|
|Account Registry|Account Registry Logic|

## Delegated Transactions
Users can delegate certain protocol actions to the Bloom admin in order to have Bloom pays the transaction. Many functions throughout these contracts are implemented with 3 functions.

* Action - Public function enabling users to interact with the contract directly
* ActionFor - Admin function enabling Bloom admin to call *Action* on behalf of a user
* ActionForUser - Private function enabling the logic of this action. Both *Action* and *ActionFor* call *ActionForUser*.

Users authorize Bloom to perform actions on their behalf by signing a message containing their intended protocol action with a private key associated with their BloomID. Each signature contains a nonce to make the signature single-use. The contracts maintain a mapping of used signatures.

`mapping (bytes32 => bool) public usedSignatures;`

If a user signs a delegated transaction, Bloom is only able to submit that signature one time. If the user needs to complete the same action again, they sign a new delegated transaction with a new nonce.

The signature definition is contained in the Signing Logic contract. The web3 APIs enabling users to sign messages with their ethereum private keys are frequently updated, sometimes with breaking changes. By isolating the signing logic in an upgradeable contract, the logic can be swapped out without needing to upgrade the whole contract.

# Account Registry
*Account Registry* implements the Bloom ID data structures and the low-level account administration functions.  The account administration functions are not publicly accessible. *Account Registry Logic* implements the public functions which access the functions in *Account Registry*.

## Account Registry Data Structures
Accounts are stored as mapping from addresses account Id.

```
  mapping(address => uint256) public accountByAddress;
```

Users can have multiple addresses associated with their Bloom Id by having the mapping of each address point to the same accountId.

## Account Registry Public Functions
### accountIdForAddress
Retrieve the account Id associated with an address. Reverts if the address is not associated with an account
#### Interface
```
function accountIdForAddress(address _address) public view returns (uint256)
```
#### Example
```
// Solidity
AccountRegistryInterface registry = "0x[address of registry contract]";
uint256 userId = registry.accountIdForAddress("0x0123...")

// Web3
accountRegistry = AccountRegistry.at("[address of registry contract]")
userId = accountRegistry.accountIdForAddress.call(address)
```

### addressBelongsToAccount
Returns bool indicating if address is associated with an account
#### Interface
```
function addressBelongsToAccount(address _address) public view returns (bool)
```
#### Example
```
// Solidity
AccountRegistryInterface registry = "0x[address of registry contract]";
require(registry.addressBelongsToAccount("0x0123..."))

// Web3
accountRegistry = AccountRegistry.at("[address of registry contract]")
hasBloomId = accountRegistry.addressBelongsToAccount.call(address)
```
## Account Registry Logic Public Functions
*Account Registry Logic* provides a public interface for Bloom and users to create and control their Bloom Ids. Users can associate create and accept invites and associate additional addresses with their BloomId. As the Bloom protocol matures, this contract can be upgraded to enable new capabilities without needing to migrate the underlying *Account Registry* storage contract.
### createInvite
Creates an invitation by a user that can be accepted by a user who receives a shared secret from the invite creator. The shared secret is the private key associated with a one-time-use Ethereum key pair. 
The sender generates a new key pair and signs their Bloom Id address with the private key. The sender then shares the private key with the recipient.
#### Interface
```
function createInvite(bytes _sig) public onlyUser
```
#### Example
```
//Web3 Example code for creating an invite
registryLogic = AccountRegistryLogic.at("[address of registry logic contract]")

// This signAddress function exists in the repo!
const { signAddress } = require("./src/signAddress");
const ethereumjsWallet = require("ethereumjs-wallet");

// Generate the private key using the ethereumjs-wallet library
// NOTE: This does not mean we are making a new ethereum account, we are
// just using these tools in order to make a private key.
const signingKeypair = ethereumjsWallet.generate();
const signingPrivateKey = signingKeypair.getPrivateKey();

// Sign the address associated with our Bloom account using the
// new signing private key
const inviteSignature = signAddress({
  address: senderAddress,
  privKey: signingPrivateKey
});

// Submit this signature to the contract
registryLogic.createInvite(inviteSignature);
// Share the signingPrivateKey with the recipient off-chain
```
### acceptInvite
Accepts an invitation by a new user
The recipient of the invitation proves they received the invitation rom the sender by signing their address with the one-time-use private key. They submit this signature to `acceptInvite`. The contract verifies the key pair has not been used by any other user, then creates a new account for the user.
#### Interface
```
function acceptInvite(bytes _sig) public onlyNonUser
```
#### Example
```
//Web3 Example code for accepting an invite
registryLogic = AccountRegistryLogic.at("[address of registry logic contract]")

const { signAddress } = require("./src/signAddress");
// receive signingPrivateKey from sender off-chain

// Sign the address associated with a nuw user account using the
// new signing private key
const inviteSignature = signAddress({
  address: recipientAddress,
  privKey: signingPrivateKey
});

// Submit this signature to the contract
registryLogic.acceptInvite(inviteSignature);
```
### addAddressToAccount
Associates an additional address with a BloomId.
To associate a new address with a BloomId, both wallets must sign a message containing the address of the other wallet and a nonce. 
#### Interface
```
  /**
   * @notice Add an address to an existing id by a user
   * @param _newAddress Address to add to account
   * @param _newAddressSig Signed message from new address confirming ownership by the sender
   * @param _senderSig Signed message from new address confirming intention by the sender
   * @param _nonce Random hex string used when generating sigs to make them one time use
   */
  function addAddressToAccount(
    address _newAddress,
    bytes _newAddressSig,
    bytes _senderSig,
    bytes32 _nonce
    ) public onlyUser;
```
#### Example
```
// Solidity - N/A - this function is not intended to be called internally or by another contract

// Add Address Signature Format
const getFormattedTypedDataAddAddress = (
  sender: string,
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
        { name: 'sender', type: 'address'},
        { name: 'nonce', type: 'bytes32'},
      ]
    },
    primaryType: 'AddAddress',
    domain: {
      name: 'Bloom',
      version: '1',
      // Rinkeby
      chainId: 4,
      // Dummy contract address for testing
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    },
    message: {
      sender: sender,
      nonce: nonce
    }
  }
}


//Web3 pseudocode
registryLogic = AccountRegistryLogic.at("[address of registry logic contract]")
nonce = soliditySha3(uuid())

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

registryLogic.addAddressToAccount(newAddress, newAddressSig, senderSig, nonce, {from: currentAddress})
```
## Account Registry Logic Admin Functions
Bloom has administrative privileges to create & modify accounts, submit delegated transactions for users and configure the external contracts. This administrative control is beneficial in the early days of the protocol. As the protocol matures Bloom’s administrative rights will diminish.
### AddAddressToAccountFor
Users can delegate certain protocol actions to the Bloom admin in order to have Bloom pays the transaction costs. A user can generate the required signatures to add multiple addresses then sends them to Bloom who submits the transaction on the user’s behalf.
The nonce is included in the signature to make these signatures single-use. The contract maintains a mapping of used signatures.
`mapping (bytes32 => bool) public usedSignatures;`
If a user adds an address to their account, then later removes it, Bloom can not re-add the address without a new signature authorizing the action from the user. This design pattern is widely used across Bloom’s contracts.


#### Interface
```
  /**
   * @notice Add an address to an existing id on behalf of a user to pay the gas costs   * @param _newAddress Address to add to account
   * @param _newAddressSig Signed message from new address confirming ownership by the sender
   * @param _senderSig Signed message from new address confirming intention by the sender
   * @param _nonce Random hex string used when generating sigs to make them one time use
   * @param _newAddress Address to add to account
   * @param _sender User requesting this action
   */
  function addAddressToAccountFor(
    address _newAddress,
    bytes _newAddressSig,
    bytes _senderSig,
    address _sender,
    bytes32 _nonce
    ) public onlyRegistryAdmin
```
#### Example
```
// Solidity - N/A - this function is not intended to be called internally or by another contract

//Web3 pseudocode
registryLogic = AccountRegistryLogic.at("[address of registry logic contract]")
nonce = soliditySha3(uuid())
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
registryLogic.addAddressToAccountFor(newAddress, 1, newAddressSig, senderSig, sender, nonce, {from: Bloom})
```
### removeAddressFromAccountFor
Remove an address from a BloomId. This action is currently restricted to be performed by the Bloom admin. In future versions of this contract, users will have more control over adding, removing and modifying the addresses associated with their account.
#### Interface
```
  function removeAddressFromAccountFor(address _addressToRemove) public onlyRegistryAdmin {
```
#### Example
```
// Solidity - N/A - this function is not intended to be called internally or by another contract

//Web3 pseudocode
registryLogic = AccountRegistryLogic.at("[address of registry logic contract]")
registryLogic.removeAddressFromAccountFor(addressToRemove, {from: Bloom})
```
### Configure External Contracts
Bloom can configure the external contracts associated with *Account Registry Logic* in order to upgrade components as standards change and the protocol matures.
## Events
*Account Registry Logic* emits events when the user accounts are created or modified and when the contract configuration changes.
```
  event AccountCreated(uint256 indexed accountId, address indexed newUser);
  event InviteCreated(address indexed inviter, address indexed inviteAddress);
  event InviteAccepted(address recipient, address indexed inviteAddress);
  event AddressAdded(uint256 indexed accountId, address indexed newAddress);
  event AddressRemoved(uint256 indexed accountId, address indexed oldAddress);
  event RegistryAdminChanged(address oldRegistryAdmin, address newRegistryAdmin);
  event SigningLogicChanged(address oldSigningLogic, address newSigningLogic);
  event AccountRegistryChanged(address oldRegistry, address newRegistry);
```
## Future Development
Some actions made possible by the *Account Registry* contract are not yet implemented in the *Account Registry Logic* contract. The contracts are designed so *Account Registry Logic* can be upgraded without needing to migrate all users to a new storage contract. 

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
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );

  bytes32 DOMAIN_SEPARATOR = hash(EIP712Domain({
      name: "Bloom",
      version: '1',
      chainId: 4, // Rinkeby
      verifyingContract: this
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
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
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
      // Rinkeby
      chainId: 4,
      // Dummy contract address for testing
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
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
Event based storage is preferable to EVM state storage for variables not critical to the contract logic in order to save a significant amount of gas. Events are just as permanent as contract storage, they just cannot be referenced from within a transaction. Attestation data such as dataHash, typeIds and requesterId are not critical to the logic of the contract. However they are critical to the Bloom Protocol. They are stored by emitting an event at the time of an attestation.
```
  event TraitAttested(
    uint256 attestationId,
    uint256 subjectId,
    uint256 attesterId,
    uint256 requesterId,
    bytes32 dataHash,
    uint256[] typeIds,
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
 }
]
```
Each component of the data is hashed individually, then the resulting array is hashed into the dataHash.
```
// Step 1
componentHashes = [hash1, hash2, ...]
// Step 2
dataHash = hash(componentHashes)
```
If a 3rd party requests a Bloom user to reveal the data that was submitted as part of an attestation, the user can choose to reveal none, some or all of the data by sending the 3rd party the hashed or plaintext data.

### TypeIds
Attestations reference an array of typeIds. typeIds refers to the index of an enabled attestation type in the *Attestation Logic*. Bloom adds attestation types to this array as they are enabled in the protocol. The current identity types that can be attested are:
0 => ‘phone’ => Associate a phone number with a BloomId
1 => ‘email’ => Associate an email address with a BloomId
```
string[] public permittedTypesList;
```
The typeIds need to be included in the signatures for the attestation process. When being signed, the typeIds are hashed into a typeHash.
```
typeHash = soliditySha3({ type: "uint256[]", value: typeIds }) }
```
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
   * @param _typeIds Array of trait type ids to validate
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
    uint256[] _typeIds,
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
    [0, 1], // type Ids corresponding to phone and email
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
    [0, 1],
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
    [0, 1], // type Ids corresponding to phone and email
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
   * @param _typeIds Array of trait type ids being attested
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
    uint256[] _typeIds,
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
    [3], // type Id corresponding to 'creditworthy'
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
    [3], // type Id corresponding to 'creditworthy'
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
    [3], // type Id corresponding to 'creditworthy'
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
### createType
Bloom maintains a list of permitted data types that can be associated with a user's BloomID.
#### Interface
```
  function createType(string _traitType) public onlyOwner;
```
#### Data Structure
```
// Public list so others can check which types are supported
  string[] public permittedTypesList;
// mapping for checking if a type is valid
// private because can't have getter for dynamically sized key
  mapping(string => bool) private permittedTypesMapping;
```

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
    uint256[] _typeIds,
    bytes32 _requestNonce,
    bytes _subjectSig,
    bytes _delegationSig
  ) public onlyOwner
```
#### Signing Logic
```
  bytes32 constant ATTEST_FOR_TYPEHASH = keccak256(
    "AttestFor(address subject,address requester,uint256 reward,bytes32 paymentNonce,bytes32 dataHash,bytes32 typeHash,bytes32 requestNonce)"
  );
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
    uint256[] _typeIds,
    bytes32 _requestNonce,
    bytes _subjectSig,
    uint256 _stakeDuration,
    bytes _delegationSig
  ) public onlyOwner;
```
#### Signing Logic
```
  bytes32 constant STAKE_FOR_TYPEHASH = keccak256(
    "StakeFor(address subject,uint256 value,bytes32 paymentNonce,bytes32 dataHash,bytes32 typeHash,bytes32 requestNonce,uint256 stakeDuration)"
  );
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
    uint256[] typeIds,
    uint256 stakeValue,
    uint256 expiresAt
    );
  event AttestationRejected(uint256 indexed attesterId, uint256 indexed requesterId);
  event AttestationRevoked(uint256 indexed subjectId, uint256 attestationId, uint256 indexed revokerId);
  event TypeCreated(string traitType);
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
 
