import * as Web3 from 'web3'
import * as BigNumber from 'bignumber.js'

import {SolidityEvent} from 'web3'
type Address = string
type TransactionOptions = Partial<Transaction>
type UInt = number | BigNumber.BigNumber

interface Transaction {
  hash: string
  nonce: number
  blockHash: string | null
  blockNumber: number | null
  transactionIndex: number | null
  from: Address | ContractInstance
  to: string | null
  value: BigNumber.BigNumber
  gasPrice: BigNumber.BigNumber
  gas: number
  input: string
}

declare type ContractTest = (accounts: string[]) => void

declare global {
  function contract(name: string, test: ContractTest): void
  var artifacts: Artifacts
  var web3: Web3
  var assert: Chai.AssertStatic
}

interface ContractInstance {
  address: string
  sendTransaction(options?: TransactionOptions): Promise<void>

  allEvents(options: {
    fromBlock: number
    toBlock: number | 'latest'
  }): Web3.FilterResult
}

interface Artifacts {
  require(name: 'AccountRegistryLogic'): AccountRegistryLogicContract
  require(name: 'AccreditationRepo'): AccreditationRepoContract
  require(name: 'Address'): AddressContract
  require(name: 'AirdropProxy'): AirdropProxyContract
  require(name: 'AttestationLogic'): AttestationLogicContract
  require(name: 'BatchAttestationLogic'): BatchAttestationLogicContract
  require(name: 'BatchInitializer'): BatchInitializerContract
  require(name: 'DependentOnIPFS'): DependentOnIPFSContract
  require(name: 'ECDSA'): ECDSAContract
  require(name: 'ERC20'): ERC20Contract
  require(name: 'IERC20'): IERC20Contract
  require(name: 'Initializable'): InitializableContract
  require(name: 'Migrations'): MigrationsContract
  require(name: 'MockBLT'): MockBLTContract
  require(name: 'Ownable'): OwnableContract
  require(name: 'Pausable'): PausableContract
  require(name: 'PauserRole'): PauserRoleContract
  require(name: 'Poll'): PollContract
  require(name: 'Roles'): RolesContract
  require(name: 'SafeERC20'): SafeERC20Contract
  require(name: 'SafeMath'): SafeMathContract
  require(name: 'SigningLogic'): SigningLogicContract
  require(name: 'TokenEscrowMarketplace'): TokenEscrowMarketplaceContract
  require(name: 'VotingCenter'): VotingCenterContract
}

export interface AccountRegistryLogicInstance extends ContractInstance {
  initializing: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  initializer: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  linkIds: {
    (unnamed0: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      unnamed0: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(unnamed0: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed0: Address, options?: TransactionOptions): Promise<number>
  }
  endInitialization: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed1: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(unnamed1: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed1: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed1: string, options?: TransactionOptions): Promise<number>
  }

  AddressLinked: Web3.EventFilterCreator<{
    currentAddress: Address
    newAddress: Address
    linkId: UInt
  }>

  AddressUnlinked: Web3.EventFilterCreator<{addressToRemove: Address}>

  InitializationEnded: Web3.EventFilterCreator<{}>

  linkAddresses: {
    (
      currentAddress: Address,
      currentAddressSig: string,
      newAddress: Address,
      newAddressSig: string,
      nonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      currentAddress: Address,
      currentAddressSig: string,
      newAddress: Address,
      newAddressSig: string,
      nonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      currentAddress: Address,
      currentAddressSig: string,
      newAddress: Address,
      newAddressSig: string,
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      currentAddress: Address,
      currentAddressSig: string,
      newAddress: Address,
      newAddressSig: string,
      nonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  unlinkAddress: {
    (
      addressToRemove: Address,
      nonce: string,
      unlinkSignature: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      addressToRemove: Address,
      nonce: string,
      unlinkSignature: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      addressToRemove: Address,
      nonce: string,
      unlinkSignature: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      addressToRemove: Address,
      nonce: string,
      unlinkSignature: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  migrateLink: {
    (
      currentAddress: Address,
      newAddress: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      currentAddress: Address,
      newAddress: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      currentAddress: Address,
      newAddress: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      currentAddress: Address,
      newAddress: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface AccountRegistryLogicContract {
  new: (
    initializer: Address,
    options?: TransactionOptions
  ) => Promise<AccountRegistryLogicInstance>
  deployed(): Promise<AccountRegistryLogicInstance>
  at(address: string): AccountRegistryLogicInstance
}

export interface AccreditationRepoInstance extends ContractInstance {
  accreditations: {
    (unnamed2: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(unnamed2: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed2: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed2: Address, options?: TransactionOptions): Promise<number>
  }
  renounceOwnership: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  isOwner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  admin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  AdminChanged: Web3.EventFilterCreator<{oldAdmin: Address; newAdmin: Address}>

  AccreditationGranted: Web3.EventFilterCreator<{attester: Address}>

  AccreditationRevoked: Web3.EventFilterCreator<{attester: Address}>

  OwnershipTransferred: Web3.EventFilterCreator<{
    previousOwner: Address
    newOwner: Address
  }>

  grantAccreditation: {
    (attester: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      attester: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(attester: Address, options?: TransactionOptions): Promise<string>
    estimateGas(attester: Address, options?: TransactionOptions): Promise<number>
  }
  revokeAccreditation: {
    (attester: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      attester: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(attester: Address, options?: TransactionOptions): Promise<string>
    estimateGas(attester: Address, options?: TransactionOptions): Promise<number>
  }
  setAdmin: {
    (newAdmin: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newAdmin: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(newAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAdmin: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AccreditationRepoContract {
  new: (
    admin: Address,
    options?: TransactionOptions
  ) => Promise<AccreditationRepoInstance>
  deployed(): Promise<AccreditationRepoInstance>
  at(address: string): AccreditationRepoInstance
}

export interface AddressInstance extends ContractInstance {}

export interface AddressContract {
  new: (options?: TransactionOptions) => Promise<AddressInstance>
  deployed(): Promise<AddressInstance>
  at(address: string): AddressInstance
}

export interface AirdropProxyInstance extends ContractInstance {
  unpause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  isPauser: {
    (account: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(account: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(account: Address, options?: TransactionOptions): Promise<string>
    estimateGas(account: Address, options?: TransactionOptions): Promise<number>
  }
  paused: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  renouncePauser: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  renounceOwnership: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  addPauser: {
    (account: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      account: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(account: Address, options?: TransactionOptions): Promise<string>
    estimateGas(account: Address, options?: TransactionOptions): Promise<number>
  }
  pause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  isOwner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  token: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  AddManager: Web3.EventFilterCreator<{address: Address}>

  RemoveManager: Web3.EventFilterCreator<{address: Address}>

  Paused: Web3.EventFilterCreator<{account: Address}>

  Unpaused: Web3.EventFilterCreator<{account: Address}>

  PauserAdded: Web3.EventFilterCreator<{account: Address}>

  PauserRemoved: Web3.EventFilterCreator<{account: Address}>

  OwnershipTransferred: Web3.EventFilterCreator<{
    previousOwner: Address
    newOwner: Address
  }>

  addManager: {
    (manager: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      manager: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(manager: Address, options?: TransactionOptions): Promise<string>
    estimateGas(manager: Address, options?: TransactionOptions): Promise<number>
  }
  removeManager: {
    (oldManager: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      oldManager: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      oldManager: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(oldManager: Address, options?: TransactionOptions): Promise<number>
  }
  airdrop: {
    (to: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  isManager: {
    (address: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(address: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(address: Address, options?: TransactionOptions): Promise<string>
    estimateGas(address: Address, options?: TransactionOptions): Promise<number>
  }
  withdrawAllTokens: {
    (to: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(to: Address, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AirdropProxyContract {
  new: (
    token: Address,
    options?: TransactionOptions
  ) => Promise<AirdropProxyInstance>
  deployed(): Promise<AirdropProxyInstance>
  at(address: string): AirdropProxyInstance
}

export interface AttestationLogicInstance extends ContractInstance {
  initializing: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenEscrowMarketplace: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  initializer: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  endInitialization: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed3: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(unnamed3: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed3: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed3: string, options?: TransactionOptions): Promise<number>
  }

  TraitAttested: Web3.EventFilterCreator<{
    subject: Address
    attester: Address
    requester: Address
    dataHash: string
  }>

  AttestationRejected: Web3.EventFilterCreator<{
    attester: Address
    requester: Address
  }>

  AttestationRevoked: Web3.EventFilterCreator<{link: string; attester: Address}>

  TokenEscrowMarketplaceChanged: Web3.EventFilterCreator<{
    oldTokenEscrowMarketplace: Address
    newTokenEscrowMarketplace: Address
  }>

  InitializationEnded: Web3.EventFilterCreator<{}>

  attest: {
    (
      subject: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  attestFor: {
    (
      subject: Address,
      attester: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      attester: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      attester: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      attester: Address,
      requester: Address,
      reward: UInt,
      requesterSig: string,
      dataHash: string,
      requestNonce: string,
      subjectSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  contest: {
    (
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  contestFor: {
    (
      attester: Address,
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      attester: Address,
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      attester: Address,
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      attester: Address,
      requester: Address,
      reward: UInt,
      requestNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  migrateAttestation: {
    (
      requester: Address,
      attester: Address,
      subject: Address,
      dataHash: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      requester: Address,
      attester: Address,
      subject: Address,
      dataHash: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      requester: Address,
      attester: Address,
      subject: Address,
      dataHash: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      requester: Address,
      attester: Address,
      subject: Address,
      dataHash: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  revokeAttestation: {
    (link: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      link: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(link: string, options?: TransactionOptions): Promise<string>
    estimateGas(link: string, options?: TransactionOptions): Promise<number>
  }
  revokeAttestationFor: {
    (
      sender: Address,
      link: string,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      sender: Address,
      link: string,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      sender: Address,
      link: string,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      sender: Address,
      link: string,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  setTokenEscrowMarketplace: {
    (newTokenEscrowMarketplace: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newTokenEscrowMarketplace: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      newTokenEscrowMarketplace: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      newTokenEscrowMarketplace: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface AttestationLogicContract {
  new: (
    initializer: Address,
    tokenEscrowMarketplace: Address,
    options?: TransactionOptions
  ) => Promise<AttestationLogicInstance>
  deployed(): Promise<AttestationLogicInstance>
  at(address: string): AttestationLogicInstance
}

export interface BatchAttestationLogicInstance extends ContractInstance {
  BatchTraitAttested: Web3.EventFilterCreator<{rootHash: string}>

  batchAttest: {
    (dataHash: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      dataHash: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(dataHash: string, options?: TransactionOptions): Promise<string>
    estimateGas(dataHash: string, options?: TransactionOptions): Promise<number>
  }
}

export interface BatchAttestationLogicContract {
  new: (options?: TransactionOptions) => Promise<BatchAttestationLogicInstance>
  deployed(): Promise<BatchAttestationLogicInstance>
  at(address: string): BatchAttestationLogicInstance
}

export interface BatchInitializerInstance extends ContractInstance {
  attestationLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  renounceOwnership: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  isOwner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registryLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  admin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  linkSkipped: Web3.EventFilterCreator<{
    currentAddress: Address
    newAddress: Address
  }>

  OwnershipTransferred: Web3.EventFilterCreator<{
    previousOwner: Address
    newOwner: Address
  }>

  setAdmin: {
    (newAdmin: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newAdmin: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(newAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAdmin: Address, options?: TransactionOptions): Promise<number>
  }
  setRegistryLogic: {
    (newRegistryLogic: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newRegistryLogic: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      newRegistryLogic: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      newRegistryLogic: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
  setAttestationLogic: {
    (newAttestationLogic: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newAttestationLogic: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      newAttestationLogic: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      newAttestationLogic: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
  setTokenEscrowMarketplace: {
    (newMarketplace: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newMarketplace: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      newMarketplace: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      newMarketplace: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
  endInitialization: {
    (initializable: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      initializable: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      initializable: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      initializable: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
  batchLinkAddresses: {
    (
      currentAddresses: Address[],
      newAddresses: Address[],
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      currentAddresses: Address[],
      newAddresses: Address[],
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      currentAddresses: Address[],
      newAddresses: Address[],
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      currentAddresses: Address[],
      newAddresses: Address[],
      options?: TransactionOptions
    ): Promise<number>
  }
  batchMigrateAttestations: {
    (
      requesters: Address[],
      attesters: Address[],
      subjects: Address[],
      dataHashes: string[],
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      requesters: Address[],
      attesters: Address[],
      subjects: Address[],
      dataHashes: string[],
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      requesters: Address[],
      attesters: Address[],
      subjects: Address[],
      dataHashes: string[],
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      requesters: Address[],
      attesters: Address[],
      subjects: Address[],
      dataHashes: string[],
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface BatchInitializerContract {
  new: (
    attestationLogic: Address,
    registryLogic: Address,
    options?: TransactionOptions
  ) => Promise<BatchInitializerInstance>
  deployed(): Promise<BatchInitializerInstance>
  at(address: string): BatchInitializerInstance
}

export interface DependentOnIPFSInstance extends ContractInstance {}

export interface DependentOnIPFSContract {
  new: (options?: TransactionOptions) => Promise<DependentOnIPFSInstance>
  deployed(): Promise<DependentOnIPFSInstance>
  at(address: string): DependentOnIPFSInstance
}

export interface ECDSAInstance extends ContractInstance {}

export interface ECDSAContract {
  new: (options?: TransactionOptions) => Promise<ECDSAInstance>
  deployed(): Promise<ECDSAInstance>
  at(address: string): ECDSAInstance
}

export interface ERC20Instance extends ContractInstance {
  Transfer: Web3.EventFilterCreator<{from: Address; to: Address; value: UInt}>

  Approval: Web3.EventFilterCreator<{owner: Address; spender: Address; value: UInt}>

  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  increaseAllowance: {
    (spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      addedValue: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      addedValue: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      addedValue: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  decreaseAllowance: {
    (spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      subtractedValue: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      subtractedValue: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      subtractedValue: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface ERC20Contract {
  new: (options?: TransactionOptions) => Promise<ERC20Instance>
  deployed(): Promise<ERC20Instance>
  at(address: string): ERC20Instance
}

export interface IERC20Instance extends ContractInstance {
  Transfer: Web3.EventFilterCreator<{from: Address; to: Address; value: UInt}>

  Approval: Web3.EventFilterCreator<{owner: Address; spender: Address; value: UInt}>

  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  balanceOf: {
    (who: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(who: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(who: Address, options?: TransactionOptions): Promise<string>
    estimateGas(who: Address, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface IERC20Contract {
  new: (options?: TransactionOptions) => Promise<IERC20Instance>
  deployed(): Promise<IERC20Instance>
  at(address: string): IERC20Instance
}

export interface InitializableInstance extends ContractInstance {
  initializing: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  initializer: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  InitializationEnded: Web3.EventFilterCreator<{}>

  endInitialization: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
}

export interface InitializableContract {
  new: (
    initializer: Address,
    options?: TransactionOptions
  ) => Promise<InitializableInstance>
  deployed(): Promise<InitializableInstance>
  at(address: string): InitializableInstance
}

export interface MigrationsInstance extends ContractInstance {
  last_completed_migration: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  setCompleted: {
    (completed: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      completed: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(completed: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(completed: UInt, options?: TransactionOptions): Promise<number>
  }
  upgrade: {
    (new_address: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      new_address: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      new_address: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(new_address: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface MigrationsContract {
  new: (options?: TransactionOptions) => Promise<MigrationsInstance>
  deployed(): Promise<MigrationsInstance>
  at(address: string): MigrationsInstance
}

export interface MockBLTInstance extends ContractInstance {
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  increaseAllowance: {
    (spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      addedValue: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      addedValue: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      addedValue: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  decreaseAllowance: {
    (spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      spender: Address,
      subtractedValue: UInt,
      options?: TransactionOptions
    ): Promise<boolean>
    sendTransaction(
      spender: Address,
      subtractedValue: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      spender: Address,
      subtractedValue: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<number>
  }

  Gift: Web3.EventFilterCreator<{recipient: Address}>

  Transfer: Web3.EventFilterCreator<{from: Address; to: Address; value: UInt}>

  Approval: Web3.EventFilterCreator<{owner: Address; spender: Address; value: UInt}>

  gift: {
    (recipient: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      recipient: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      recipient: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      recipient: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface MockBLTContract {
  new: (options?: TransactionOptions) => Promise<MockBLTInstance>
  deployed(): Promise<MockBLTInstance>
  at(address: string): MockBLTInstance
}

export interface OwnableInstance extends ContractInstance {
  OwnershipTransferred: Web3.EventFilterCreator<{
    previousOwner: Address
    newOwner: Address
  }>

  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  isOwner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  renounceOwnership: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface OwnableContract {
  new: (options?: TransactionOptions) => Promise<OwnableInstance>
  deployed(): Promise<OwnableInstance>
  at(address: string): OwnableInstance
}

export interface PausableInstance extends ContractInstance {
  isPauser: {
    (account: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(account: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(account: Address, options?: TransactionOptions): Promise<string>
    estimateGas(account: Address, options?: TransactionOptions): Promise<number>
  }
  renouncePauser: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  addPauser: {
    (account: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      account: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(account: Address, options?: TransactionOptions): Promise<string>
    estimateGas(account: Address, options?: TransactionOptions): Promise<number>
  }

  Paused: Web3.EventFilterCreator<{account: Address}>

  Unpaused: Web3.EventFilterCreator<{account: Address}>

  PauserAdded: Web3.EventFilterCreator<{account: Address}>

  PauserRemoved: Web3.EventFilterCreator<{account: Address}>

  paused: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  pause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  unpause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
}

export interface PausableContract {
  new: (options?: TransactionOptions) => Promise<PausableInstance>
  deployed(): Promise<PausableInstance>
  at(address: string): PausableInstance
}

export interface PauserRoleInstance extends ContractInstance {
  PauserAdded: Web3.EventFilterCreator<{account: Address}>

  PauserRemoved: Web3.EventFilterCreator<{account: Address}>

  isPauser: {
    (account: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(account: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(account: Address, options?: TransactionOptions): Promise<string>
    estimateGas(account: Address, options?: TransactionOptions): Promise<number>
  }
  addPauser: {
    (account: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      account: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(account: Address, options?: TransactionOptions): Promise<string>
    estimateGas(account: Address, options?: TransactionOptions): Promise<number>
  }
  renouncePauser: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
}

export interface PauserRoleContract {
  new: (options?: TransactionOptions) => Promise<PauserRoleInstance>
  deployed(): Promise<PauserRoleInstance>
  at(address: string): PauserRoleInstance
}

export interface PollInstance extends ContractInstance {
  endTime: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  startTime: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  pollDataMultihash: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  author: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  numChoices: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed4: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(unnamed4: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed4: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed4: string, options?: TransactionOptions): Promise<number>
  }

  VoteCast: Web3.EventFilterCreator<{voter: Address; choice: UInt}>

  vote: {
    (choice: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      choice: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(choice: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(choice: UInt, options?: TransactionOptions): Promise<number>
  }
  voteFor: {
    (
      choice: UInt,
      voter: Address,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      choice: UInt,
      voter: Address,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      choice: UInt,
      voter: Address,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      choice: UInt,
      voter: Address,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface PollContract {
  new: (
    name: string,
    chainId: UInt,
    ipfsHash: string,
    numChoices: UInt,
    startTime: UInt,
    endTime: UInt,
    author: Address,
    options?: TransactionOptions
  ) => Promise<PollInstance>
  deployed(): Promise<PollInstance>
  at(address: string): PollInstance
}

export interface RolesInstance extends ContractInstance {}

export interface RolesContract {
  new: (options?: TransactionOptions) => Promise<RolesInstance>
  deployed(): Promise<RolesInstance>
  at(address: string): RolesInstance
}

export interface SafeERC20Instance extends ContractInstance {}

export interface SafeERC20Contract {
  new: (options?: TransactionOptions) => Promise<SafeERC20Instance>
  deployed(): Promise<SafeERC20Instance>
  at(address: string): SafeERC20Instance
}

export interface SafeMathInstance extends ContractInstance {}

export interface SafeMathContract {
  new: (options?: TransactionOptions) => Promise<SafeMathInstance>
  deployed(): Promise<SafeMathInstance>
  at(address: string): SafeMathInstance
}

export interface SigningLogicInstance extends ContractInstance {
  usedSignatures: {
    (unnamed5: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(unnamed5: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed5: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed5: string, options?: TransactionOptions): Promise<number>
  }
}

export interface SigningLogicContract {
  new: (
    name: string,
    version: string,
    chainId: UInt,
    options?: TransactionOptions
  ) => Promise<SigningLogicInstance>
  deployed(): Promise<SigningLogicInstance>
  at(address: string): SigningLogicInstance
}

export interface TokenEscrowMarketplaceInstance extends ContractInstance {
  attestationLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenEscrow: {
    (unnamed6: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      unnamed6: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(unnamed6: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed6: Address, options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed7: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(unnamed7: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed7: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed7: string, options?: TransactionOptions): Promise<number>
  }
  token: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  TokenMarketplaceWithdrawal: Web3.EventFilterCreator<{
    escrowPayer: Address
    amount: UInt
  }>

  TokenMarketplaceEscrowPayment: Web3.EventFilterCreator<{
    escrowPayer: Address
    escrowPayee: Address
    amount: UInt
  }>

  TokenMarketplaceDeposit: Web3.EventFilterCreator<{
    escrowPayer: Address
    amount: UInt
  }>

  moveTokensToEscrowLockupFor: {
    (
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  moveTokensToEscrowLockup: {
    (amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(amount: UInt, options?: TransactionOptions): Promise<number>
  }
  releaseTokensFromEscrowFor: {
    (
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      sender: Address,
      amount: UInt,
      nonce: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  releaseTokensFromEscrow: {
    (amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(amount: UInt, options?: TransactionOptions): Promise<number>
  }
  requestTokenPayment: {
    (
      payer: Address,
      receiver: Address,
      amount: UInt,
      nonce: string,
      paymentSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      payer: Address,
      receiver: Address,
      amount: UInt,
      nonce: string,
      paymentSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      payer: Address,
      receiver: Address,
      amount: UInt,
      nonce: string,
      paymentSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      payer: Address,
      receiver: Address,
      amount: UInt,
      nonce: string,
      paymentSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface TokenEscrowMarketplaceContract {
  new: (
    token: Address,
    attestationLogic: Address,
    options?: TransactionOptions
  ) => Promise<TokenEscrowMarketplaceInstance>
  deployed(): Promise<TokenEscrowMarketplaceInstance>
  at(address: string): TokenEscrowMarketplaceInstance
}

export interface VotingCenterInstance extends ContractInstance {
  polls: {
    (unnamed8: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed8: UInt, options?: TransactionOptions): Promise<Address>
    sendTransaction(unnamed8: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed8: UInt, options?: TransactionOptions): Promise<number>
  }
  PollCreated: Web3.EventFilterCreator<{poll: Address; author: Address}>

  createPoll: {
    (
      name: string,
      chainId: UInt,
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      name: string,
      chainId: UInt,
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      options?: TransactionOptions
    ): Promise<Address>
    sendTransaction(
      name: string,
      chainId: UInt,
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      name: string,
      chainId: UInt,
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  allPolls: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address[]>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  numPolls: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
}

export interface VotingCenterContract {
  new: (options?: TransactionOptions) => Promise<VotingCenterInstance>
  deployed(): Promise<VotingCenterInstance>
  at(address: string): VotingCenterInstance
}
