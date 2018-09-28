import * as Web3 from "web3"
import * as BigNumber from "bignumber.js"
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
}

interface Artifacts {
  require(name: "AccountRegistry"): AccountRegistryContract
  require(name: "AccountRegistryBatchAdmin"): AccountRegistryBatchAdminContract
  require(name: "AccountRegistryInterface"): AccountRegistryInterfaceContract
  require(name: "AccountRegistryLogic"): AccountRegistryLogicContract
  require(name: "AccreditationRepo"): AccreditationRepoContract
  require(name: "AirdropProxy"): AirdropProxyContract
  require(name: "ApproveAndCallFallBack"): ApproveAndCallFallBackContract
  require(name: "AttestationLogic"): AttestationLogicContract
  require(name: "AttestationLogicUpgradeMode"): AttestationLogicUpgradeModeContract
  require(name: "AttestationRepo"): AttestationRepoContract
  require(name: "AttestationRepoInterface"): AttestationRepoInterfaceContract
  require(name: "BasicToken"): BasicTokenContract
  require(name: "BLT"): BLTContract
  require(name: "Controlled"): ControlledContract
  require(name: "ConvertLib"): ConvertLibContract
  require(name: "DependentOnIPFS"): DependentOnIPFSContract
  require(name: "ECRecovery"): ECRecoveryContract
  require(name: "ERC20"): ERC20Contract
  require(name: "ERC20Basic"): ERC20BasicContract
  require(name: "HasNoEther"): HasNoEtherContract
  require(name: "Math"): MathContract
  require(name: "MetaCoin"): MetaCoinContract
  require(name: "Migrations"): MigrationsContract
  require(name: "MiniMeToken"): MiniMeTokenContract
  require(name: "MiniMeTokenFactory"): MiniMeTokenFactoryContract
  require(name: "MiniMeVestedToken"): MiniMeVestedTokenContract
  require(name: "MockBLT"): MockBLTContract
  require(name: "Ownable"): OwnableContract
  require(name: "Pausable"): PausableContract
  require(name: "Poll"): PollContract
  require(name: "SafeERC20"): SafeERC20Contract
  require(name: "SafeMath"): SafeMathContract
  require(name: "SigningLogic"): SigningLogicContract
  require(name: "SigningLogicInterface"): SigningLogicInterfaceContract
  require(name: "SigningLogicLegacy"): SigningLogicLegacyContract
  require(name: "StandardToken"): StandardTokenContract
  require(name: "TokenController"): TokenControllerContract
  require(name: "TokenEscrowMarketplace"): TokenEscrowMarketplaceContract
  require(name: "VotingCenter"): VotingCenterContract
}

export interface AccountRegistryInstance extends ContractInstance {
  accountRegistryLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  accountByAddress: {
    (unnamed0: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed0: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(unnamed0: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed0: Address, options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }

  AccountRegistryLogicChanged: Web3.EventFilterCreator<{ oldRegistryLogic: Address; newRegistryLogic: Address }>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  setRegistryLogic: {
    (newRegistryLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newRegistryLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newRegistryLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newRegistryLogic: Address, options?: TransactionOptions): Promise<number>
  }
  accountIdForAddress: {
    (address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(address: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(address: Address, options?: TransactionOptions): Promise<string>
    estimateGas(address: Address, options?: TransactionOptions): Promise<number>
  }
  addressBelongsToAccount: {
    (address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(address: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(address: Address, options?: TransactionOptions): Promise<string>
    estimateGas(address: Address, options?: TransactionOptions): Promise<number>
  }
  createNewAccount: {
    (newUser: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newUser: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newUser: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newUser: Address, options?: TransactionOptions): Promise<number>
  }
  addAddressToAccount: {
    (newAddress: Address, sender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAddress: Address, sender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAddress: Address, sender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAddress: Address, sender: Address, options?: TransactionOptions): Promise<number>
  }
  removeAddressFromAccount: {
    (addressToRemove: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addressToRemove: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(addressToRemove: Address, options?: TransactionOptions): Promise<string>
    estimateGas(addressToRemove: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AccountRegistryContract {
  new: (accountRegistryLogic: Address, options?: TransactionOptions) => Promise<AccountRegistryInstance>
  deployed(): Promise<AccountRegistryInstance>
  at(address: string): AccountRegistryInstance
}

export interface AccountRegistryBatchAdminInstance extends ContractInstance {
  registryAdmin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registry: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  logic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }

  addressSkipped: Web3.EventFilterCreator<{ skippedAddress: Address }>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  setRegistryAdmin: {
    (newRegistryAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newRegistryAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newRegistryAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newRegistryAdmin: Address, options?: TransactionOptions): Promise<number>
  }
  batchCreateAccount: {
    (newUsers: Address[], options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newUsers: Address[], options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newUsers: Address[], options?: TransactionOptions): Promise<string>
    estimateGas(newUsers: Address[], options?: TransactionOptions): Promise<number>
  }
}

export interface AccountRegistryBatchAdminContract {
  new: (registry: Address, logic: Address, options?: TransactionOptions) => Promise<AccountRegistryBatchAdminInstance>
  deployed(): Promise<AccountRegistryBatchAdminInstance>
  at(address: string): AccountRegistryBatchAdminInstance
}

export interface AccountRegistryInterfaceInstance extends ContractInstance {
  accountIdForAddress: {
    (address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(address: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(address: Address, options?: TransactionOptions): Promise<string>
    estimateGas(address: Address, options?: TransactionOptions): Promise<number>
  }
  addressBelongsToAccount: {
    (address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(address: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(address: Address, options?: TransactionOptions): Promise<string>
    estimateGas(address: Address, options?: TransactionOptions): Promise<number>
  }
  createNewAccount: {
    (newUser: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newUser: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newUser: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newUser: Address, options?: TransactionOptions): Promise<number>
  }
  addAddressToAccount: {
    (newAddress: Address, sender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAddress: Address, sender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAddress: Address, sender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAddress: Address, sender: Address, options?: TransactionOptions): Promise<number>
  }
  removeAddressFromAccount: {
    (addressToRemove: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addressToRemove: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(addressToRemove: Address, options?: TransactionOptions): Promise<string>
    estimateGas(addressToRemove: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AccountRegistryInterfaceContract {
  new: (options?: TransactionOptions) => Promise<AccountRegistryInterfaceInstance>
  deployed(): Promise<AccountRegistryInterfaceInstance>
  at(address: string): AccountRegistryInterfaceInstance
}

export interface AccountRegistryLogicInstance extends ContractInstance {
  pendingInvites: {
    (unnamed1: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed1: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed1: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed1: Address, options?: TransactionOptions): Promise<number>
  }
  signingLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registryAdmin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registry: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed2: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed2: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed2: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed2: string, options?: TransactionOptions): Promise<number>
  }

  AccountCreated: Web3.EventFilterCreator<{ accountId: UInt; newUser: Address }>

  InviteCreated: Web3.EventFilterCreator<{ inviter: Address; inviteAddress: Address }>

  InviteAccepted: Web3.EventFilterCreator<{ recipient: Address; inviteAddress: Address }>

  AddressAdded: Web3.EventFilterCreator<{ accountId: UInt; newAddress: Address }>

  AddressRemoved: Web3.EventFilterCreator<{ accountId: UInt; oldAddress: Address }>

  RegistryAdminChanged: Web3.EventFilterCreator<{ oldRegistryAdmin: Address; newRegistryAdmin: Address }>

  SigningLogicChanged: Web3.EventFilterCreator<{ oldSigningLogic: Address; newSigningLogic: Address }>

  AccountRegistryChanged: Web3.EventFilterCreator<{ oldRegistry: Address; newRegistry: Address }>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  setSigningLogic: {
    (newSigningLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newSigningLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newSigningLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newSigningLogic: Address, options?: TransactionOptions): Promise<number>
  }
  setRegistryAdmin: {
    (newRegistryAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newRegistryAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newRegistryAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newRegistryAdmin: Address, options?: TransactionOptions): Promise<number>
  }
  setAccountRegistry: {
    (newRegistry: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newRegistry: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newRegistry: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newRegistry: Address, options?: TransactionOptions): Promise<number>
  }
  createInvite: {
    (sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(sig: string, options?: TransactionOptions): Promise<string>
    estimateGas(sig: string, options?: TransactionOptions): Promise<number>
  }
  acceptInvite: {
    (sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(sig: string, options?: TransactionOptions): Promise<string>
    estimateGas(sig: string, options?: TransactionOptions): Promise<number>
  }
  createAccount: {
    (newUser: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newUser: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newUser: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newUser: Address, options?: TransactionOptions): Promise<number>
  }
  addAddressToAccountFor: {
    (newAddress: Address, newAddressSig: string, senderSig: string, sender: Address, nonce: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      newAddress: Address,
      newAddressSig: string,
      senderSig: string,
      sender: Address,
      nonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      newAddress: Address,
      newAddressSig: string,
      senderSig: string,
      sender: Address,
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      newAddress: Address,
      newAddressSig: string,
      senderSig: string,
      sender: Address,
      nonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  addAddressToAccount: {
    (newAddress: Address, newAddressSig: string, senderSig: string, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAddress: Address, newAddressSig: string, senderSig: string, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAddress: Address, newAddressSig: string, senderSig: string, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(newAddress: Address, newAddressSig: string, senderSig: string, nonce: string, options?: TransactionOptions): Promise<number>
  }
  removeAddressFromAccountFor: {
    (addressToRemove: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addressToRemove: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(addressToRemove: Address, options?: TransactionOptions): Promise<string>
    estimateGas(addressToRemove: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AccountRegistryLogicContract {
  new: (signingLogic: Address, registry: Address, options?: TransactionOptions) => Promise<AccountRegistryLogicInstance>
  deployed(): Promise<AccountRegistryLogicInstance>
  at(address: string): AccountRegistryLogicInstance
}

export interface AccreditationRepoInstance extends ContractInstance {
  accreditations: {
    (unnamed3: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed3: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed3: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed3: Address, options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  admin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  AdminChanged: Web3.EventFilterCreator<{ oldAdmin: Address; newAdmin: Address }>

  AccreditationGranted: Web3.EventFilterCreator<{ attester: Address }>

  AccreditationRevoked: Web3.EventFilterCreator<{ attester: Address }>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  grantAccreditation: {
    (attester: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(attester: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(attester: Address, options?: TransactionOptions): Promise<string>
    estimateGas(attester: Address, options?: TransactionOptions): Promise<number>
  }
  revokeAccreditation: {
    (attester: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(attester: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(attester: Address, options?: TransactionOptions): Promise<string>
    estimateGas(attester: Address, options?: TransactionOptions): Promise<number>
  }
  setAdmin: {
    (newAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAdmin: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AccreditationRepoContract {
  new: (admin: Address, options?: TransactionOptions) => Promise<AccreditationRepoInstance>
  deployed(): Promise<AccreditationRepoInstance>
  at(address: string): AccreditationRepoInstance
}

export interface AirdropProxyInstance extends ContractInstance {
  unpause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
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
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  reclaimEther: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  token: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  AddManager: Web3.EventFilterCreator<{ address: Address }>

  RemoveManager: Web3.EventFilterCreator<{ address: Address }>

  Pause: Web3.EventFilterCreator<{}>

  Unpause: Web3.EventFilterCreator<{}>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  addManager: {
    (manager: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(manager: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(manager: Address, options?: TransactionOptions): Promise<string>
    estimateGas(manager: Address, options?: TransactionOptions): Promise<number>
  }
  removeManager: {
    (oldManager: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(oldManager: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(oldManager: Address, options?: TransactionOptions): Promise<string>
    estimateGas(oldManager: Address, options?: TransactionOptions): Promise<number>
  }
  airdrop: {
    (to: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(to: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  isManager: {
    (address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
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
  new: (token: Address, options?: TransactionOptions) => Promise<AirdropProxyInstance>
  deployed(): Promise<AirdropProxyInstance>
  at(address: string): AirdropProxyInstance
}

export interface ApproveAndCallFallBackInstance extends ContractInstance {
  receiveApproval: {
    (from: Address, amount: UInt, token: Address, data: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, amount: UInt, token: Address, data: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(from: Address, amount: UInt, token: Address, data: string, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, amount: UInt, token: Address, data: string, options?: TransactionOptions): Promise<number>
  }
}

export interface ApproveAndCallFallBackContract {
  new: (options?: TransactionOptions) => Promise<ApproveAndCallFallBackInstance>
  deployed(): Promise<ApproveAndCallFallBackInstance>
  at(address: string): ApproveAndCallFallBackInstance
}

export interface AttestationLogicInstance extends ContractInstance {
  attestationRepo: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  signingLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenEscrowMarketplace: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  permittedTypesList: {
    (unnamed4: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed4: UInt, options?: TransactionOptions): Promise<string>
    sendTransaction(unnamed4: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed4: UInt, options?: TransactionOptions): Promise<number>
  }
  registry: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  admin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed5: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed5: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed5: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed5: string, options?: TransactionOptions): Promise<number>
  }

  TraitAttested: Web3.EventFilterCreator<{
    attestationId: UInt
    subjectId: UInt
    attesterId: UInt
    requesterId: UInt
    dataHash: string
    typeIds: UInt[]
    stakeValue: UInt
    expiresAt: UInt
  }>

  AttestationRejected: Web3.EventFilterCreator<{ attesterId: UInt; requesterId: UInt }>

  AttestationRevoked: Web3.EventFilterCreator<{ subjectId: UInt; attestationId: UInt; revokerId: UInt }>

  TypeCreated: Web3.EventFilterCreator<{ traitType: string }>

  StakeSubmitted: Web3.EventFilterCreator<{ subjectId: UInt; stakerId: UInt; attestationId: UInt; expiresAt: UInt }>

  StakedTokensReclaimed: Web3.EventFilterCreator<{ stakerId: UInt; value: UInt }>

  AccountRegistryChanged: Web3.EventFilterCreator<{ oldRegistry: Address; newRegistry: Address }>

  AttestationRepoChanged: Web3.EventFilterCreator<{ oldAttestationRepo: Address; newAttestationRepo: Address }>

  SigningLogicChanged: Web3.EventFilterCreator<{ oldSigningLogic: Address; newSigningLogic: Address }>

  TokenEscrowMarketplaceChanged: Web3.EventFilterCreator<{ oldTokenEscrowMarketplace: Address; newTokenEscrowMarketplace: Address }>

  AdminChanged: Web3.EventFilterCreator<{ oldAdmin: Address; newAdmin: Address }>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  attest: {
    (
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
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
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
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
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
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
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
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
      paymentNonce: string,
      requesterSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  contest: {
    (requester: Address, reward: UInt, paymentNonce: string, requesterSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(requester: Address, reward: UInt, paymentNonce: string, requesterSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(requester: Address, reward: UInt, paymentNonce: string, requesterSig: string, options?: TransactionOptions): Promise<string>
    estimateGas(requester: Address, reward: UInt, paymentNonce: string, requesterSig: string, options?: TransactionOptions): Promise<number>
  }
  contestFor: {
    (
      attester: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      attester: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      attester: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      attester: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      requesterSig: string,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  validateSubjectSig: {
    (
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  createType: {
    (traitType: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(traitType: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(traitType: string, options?: TransactionOptions): Promise<string>
    estimateGas(traitType: string, options?: TransactionOptions): Promise<number>
  }
  traitTypesExist: {
    (typeIds: UInt[], options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(typeIds: UInt[], options?: TransactionOptions): Promise<boolean>
    sendTransaction(typeIds: UInt[], options?: TransactionOptions): Promise<string>
    estimateGas(typeIds: UInt[], options?: TransactionOptions): Promise<number>
  }
  revokeAttestation: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  stake: {
    (
      subject: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  stakeFor: {
    (
      subject: Address,
      staker: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      staker: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      staker: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      staker: Address,
      value: UInt,
      paymentNonce: string,
      paymentSig: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      subjectSig: string,
      stakeDuration: UInt,
      delegationSig: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  reclaimStakedTokens: {
    (attestationId: UInt, subjectId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(attestationId: UInt, subjectId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(attestationId: UInt, subjectId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(attestationId: UInt, subjectId: UInt, options?: TransactionOptions): Promise<number>
  }
  reclaimStakedTokensFor: {
    (subjectId: UInt, staker: Address, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, staker: Address, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, staker: Address, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, staker: Address, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  revokeStake: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  revokeStakeFor: {
    (subjectId: UInt, staker: Address, attestationId: UInt, delegationSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, staker: Address, attestationId: UInt, delegationSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, staker: Address, attestationId: UInt, delegationSig: string, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, staker: Address, attestationId: UInt, delegationSig: string, options?: TransactionOptions): Promise<number>
  }
  setAdmin: {
    (newAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAdmin: Address, options?: TransactionOptions): Promise<number>
  }
  setAccountRegistry: {
    (newRegistry: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newRegistry: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newRegistry: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newRegistry: Address, options?: TransactionOptions): Promise<number>
  }
  setSigningLogic: {
    (newSigningLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newSigningLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newSigningLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newSigningLogic: Address, options?: TransactionOptions): Promise<number>
  }
  setAttestationRepo: {
    (newAttestationRepo: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAttestationRepo: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAttestationRepo: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAttestationRepo: Address, options?: TransactionOptions): Promise<number>
  }
  setTokenEscrowMarketplace: {
    (newTokenEscrowMarketplace: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newTokenEscrowMarketplace: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newTokenEscrowMarketplace: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newTokenEscrowMarketplace: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface AttestationLogicContract {
  new: (
    registry: Address,
    attestationRepo: Address,
    signingLogic: Address,
    tokenEscrowMarketplace: Address,
    options?: TransactionOptions
  ) => Promise<AttestationLogicInstance>
  deployed(): Promise<AttestationLogicInstance>
  at(address: string): AttestationLogicInstance
}

export interface AttestationLogicUpgradeModeInstance extends ContractInstance {
  attestationRepo: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registry: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }

  TraitAttested: Web3.EventFilterCreator<{
    attestationId: UInt
    subjectId: UInt
    attesterId: UInt
    requesterId: UInt
    dataHash: string
    typeIds: UInt[]
    stakeValue: UInt
    expiresAt: UInt
  }>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  proxyWriteAttestation: {
    (
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      timestamp: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      timestamp: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      timestamp: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      timestamp: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface AttestationLogicUpgradeModeContract {
  new: (registry: Address, attestationRepo: Address, options?: TransactionOptions) => Promise<AttestationLogicUpgradeModeInstance>
  deployed(): Promise<AttestationLogicUpgradeModeInstance>
  at(address: string): AttestationLogicUpgradeModeInstance
}

export interface AttestationRepoInstance extends ContractInstance {
  attestationLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  unpause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
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
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  attestations: {
    (unnamed6: UInt, unnamed7: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      unnamed6: UInt,
      unnamed7: UInt,
      options?: TransactionOptions
    ): Promise<[BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber]>
    sendTransaction(unnamed6: UInt, unnamed7: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed6: UInt, unnamed7: UInt, options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  token: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  AttestationLogicChanged: Web3.EventFilterCreator<{ oldAttestationLogic: Address; newAttestationLogic: Address }>

  Pause: Web3.EventFilterCreator<{}>

  Unpause: Web3.EventFilterCreator<{}>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  setAttestationLogic: {
    (newAttestationLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAttestationLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAttestationLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAttestationLogic: Address, options?: TransactionOptions): Promise<number>
  }
  writeAttestation: {
    (subjectId: UInt, attesterId: UInt, timestamp: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      subjectId: UInt,
      attesterId: UInt,
      timestamp: UInt,
      stakeValue: UInt,
      expiresAt: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(
      subjectId: UInt,
      attesterId: UInt,
      timestamp: UInt,
      stakeValue: UInt,
      expiresAt: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(subjectId: UInt, attesterId: UInt, timestamp: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<number>
  }
  readAttestation: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      subjectId: UInt,
      attestationId: UInt,
      options?: TransactionOptions
    ): Promise<[BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber]>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  revokeAttestation: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  writeStake: {
    (subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<number>
  }
  transferTokensToStaker: {
    (staker: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(staker: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(staker: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(staker: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface AttestationRepoContract {
  new: (token: Address, attestationLogic: Address, options?: TransactionOptions) => Promise<AttestationRepoInstance>
  deployed(): Promise<AttestationRepoInstance>
  at(address: string): AttestationRepoInstance
}

export interface AttestationRepoInterfaceInstance extends ContractInstance {
  writeAttestation: {
    (subjectId: UInt, attesterId: UInt, timestamp: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      subjectId: UInt,
      attesterId: UInt,
      timestamp: UInt,
      stakeValue: UInt,
      expiresAt: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>
    sendTransaction(
      subjectId: UInt,
      attesterId: UInt,
      timestamp: UInt,
      stakeValue: UInt,
      expiresAt: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(subjectId: UInt, attesterId: UInt, timestamp: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<number>
  }
  setAttestationLogic: {
    (newAttestationLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAttestationLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAttestationLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAttestationLogic: Address, options?: TransactionOptions): Promise<number>
  }
  readAttestation: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      subjectId: UInt,
      attestationId: UInt,
      options?: TransactionOptions
    ): Promise<[BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber]>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  revokeAttestation: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  writeStake: {
    (subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, stakeValue: UInt, expiresAt: UInt, options?: TransactionOptions): Promise<number>
  }
  transferTokensToStaker: {
    (staker: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(staker: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(staker: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(staker: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface AttestationRepoInterfaceContract {
  new: (options?: TransactionOptions) => Promise<AttestationRepoInterfaceInstance>
  deployed(): Promise<AttestationRepoInterfaceInstance>
  at(address: string): AttestationRepoInterfaceInstance
}

export interface BasicTokenInstance extends ContractInstance {
  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt }>

  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface BasicTokenContract {
  new: (options?: TransactionOptions) => Promise<BasicTokenInstance>
  deployed(): Promise<BasicTokenInstance>
  at(address: string): BasicTokenInstance
}

export interface BLTInstance extends ContractInstance {
  tokenGrantsCount: {
    (holder: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, options?: TransactionOptions): Promise<number>
  }
  name: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  approve: {
    (spender: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  spendableBalanceOf: {
    (holder: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, options?: TransactionOptions): Promise<number>
  }
  creationBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  canCreateGrants: {
    (unnamed8: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed8: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed8: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed8: Address, options?: TransactionOptions): Promise<number>
  }
  setCanCreateGrants: {
    (addr: Address, allowed: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addr: Address, allowed: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(addr: Address, allowed: boolean, options?: TransactionOptions): Promise<string>
    estimateGas(addr: Address, allowed: boolean, options?: TransactionOptions): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  grants: {
    (unnamed9: Address, unnamed10: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      unnamed9: Address,
      unnamed10: UInt,
      options?: TransactionOptions
    ): Promise<[Address, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, boolean, boolean]>
    sendTransaction(unnamed9: Address, unnamed10: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed9: Address, unnamed10: UInt, options?: TransactionOptions): Promise<number>
  }
  decimals: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newController: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newController: Address, options?: TransactionOptions): Promise<number>
  }
  balanceOfAt: {
    (owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<number>
  }
  version: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenGrant: {
    (holder: Address, grantId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      holder: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<[Address, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, boolean, boolean]>
    sendTransaction(holder: Address, grantId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, grantId: UInt, options?: TransactionOptions): Promise<number>
  }
  createCloneToken: {
    (
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>
    sendTransaction(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<number>
  }
  lastTokenIsTransferableDate: {
    (holder: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, options?: TransactionOptions): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  parentToken: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  generateTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  symbol: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  grantVestedTokens: {
    (
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<number>
  }
  totalSupplyAt: {
    (blockNumber: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(blockNumber: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(blockNumber: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(blockNumber: UInt, options?: TransactionOptions): Promise<number>
  }
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  revokeTokenGrant: {
    (holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<number>
  }
  transfersEnabled: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  parentSnapShotBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  approveAndCall: {
    (spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<number>
  }
  transferableTokens: {
    (holder: Address, time: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, time: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, time: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, time: UInt, options?: TransactionOptions): Promise<number>
  }
  destroyTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, spender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, options?: TransactionOptions): Promise<number>
  }
  claimTokens: {
    (token: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(token: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(token: Address, options?: TransactionOptions): Promise<string>
    estimateGas(token: Address, options?: TransactionOptions): Promise<number>
  }
  vestingWhitelister: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenFactory: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  enableTransfers: {
    (transfersEnabled: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(transfersEnabled: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(transfersEnabled: boolean, options?: TransactionOptions): Promise<string>
    estimateGas(transfersEnabled: boolean, options?: TransactionOptions): Promise<number>
  }
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  changeVestingWhitelister: {
    (newWhitelister: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newWhitelister: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newWhitelister: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newWhitelister: Address, options?: TransactionOptions): Promise<number>
  }

  NewTokenGrant: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt; grantId: UInt }>

  ClaimedTokens: Web3.EventFilterCreator<{ token: Address; controller: Address; amount: UInt }>

  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; amount: UInt }>

  NewCloneToken: Web3.EventFilterCreator<{ cloneToken: Address; snapshotBlock: UInt }>

  Approval: Web3.EventFilterCreator<{ owner: Address; spender: Address; amount: UInt }>
}

export interface BLTContract {
  new: (tokenFactory: Address, options?: TransactionOptions) => Promise<BLTInstance>
  deployed(): Promise<BLTInstance>
  at(address: string): BLTInstance
}

export interface ControlledInstance extends ContractInstance {
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newController: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newController: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface ControlledContract {
  new: (options?: TransactionOptions) => Promise<ControlledInstance>
  deployed(): Promise<ControlledInstance>
  at(address: string): ControlledInstance
}

export interface ConvertLibInstance extends ContractInstance {
  convert: {
    (amount: UInt, conversionRate: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(amount: UInt, conversionRate: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(amount: UInt, conversionRate: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(amount: UInt, conversionRate: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface ConvertLibContract {
  new: (options?: TransactionOptions) => Promise<ConvertLibInstance>
  deployed(): Promise<ConvertLibInstance>
  at(address: string): ConvertLibInstance
}

export interface DependentOnIPFSInstance extends ContractInstance {}

export interface DependentOnIPFSContract {
  new: (options?: TransactionOptions) => Promise<DependentOnIPFSInstance>
  deployed(): Promise<DependentOnIPFSInstance>
  at(address: string): DependentOnIPFSInstance
}

export interface ECRecoveryInstance extends ContractInstance {
  recover: {
    (hash: string, sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(hash: string, sig: string, options?: TransactionOptions): Promise<Address>
    sendTransaction(hash: string, sig: string, options?: TransactionOptions): Promise<string>
    estimateGas(hash: string, sig: string, options?: TransactionOptions): Promise<number>
  }
}

export interface ECRecoveryContract {
  new: (options?: TransactionOptions) => Promise<ECRecoveryInstance>
  deployed(): Promise<ECRecoveryInstance>
  at(address: string): ECRecoveryInstance
}

export interface ERC20Instance extends ContractInstance {
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
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  Approval: Web3.EventFilterCreator<{ owner: Address; spender: Address; value: UInt }>

  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt }>

  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, spender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, options?: TransactionOptions): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface ERC20Contract {
  new: (options?: TransactionOptions) => Promise<ERC20Instance>
  deployed(): Promise<ERC20Instance>
  at(address: string): ERC20Instance
}

export interface ERC20BasicInstance extends ContractInstance {
  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt }>

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
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface ERC20BasicContract {
  new: (options?: TransactionOptions) => Promise<ERC20BasicInstance>
  deployed(): Promise<ERC20BasicInstance>
  at(address: string): ERC20BasicInstance
}

export interface HasNoEtherInstance extends ContractInstance {
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  reclaimEther: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
}

export interface HasNoEtherContract {
  new: (options?: TransactionOptions) => Promise<HasNoEtherInstance>
  deployed(): Promise<HasNoEtherInstance>
  at(address: string): HasNoEtherInstance
}

export interface MathInstance extends ContractInstance {}

export interface MathContract {
  new: (options?: TransactionOptions) => Promise<MathInstance>
  deployed(): Promise<MathInstance>
  at(address: string): MathInstance
}

export interface MetaCoinInstance extends ContractInstance {
  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt }>

  sendCoin: {
    (receiver: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(receiver: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(receiver: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(receiver: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  getBalanceInEth: {
    (addr: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addr: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(addr: Address, options?: TransactionOptions): Promise<string>
    estimateGas(addr: Address, options?: TransactionOptions): Promise<number>
  }
  getBalance: {
    (addr: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addr: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(addr: Address, options?: TransactionOptions): Promise<string>
    estimateGas(addr: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface MetaCoinContract {
  new: (options?: TransactionOptions) => Promise<MetaCoinInstance>
  deployed(): Promise<MetaCoinInstance>
  at(address: string): MetaCoinInstance
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
    call(completed: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(completed: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(completed: UInt, options?: TransactionOptions): Promise<number>
  }
  upgrade: {
    (new_address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(new_address: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(new_address: Address, options?: TransactionOptions): Promise<string>
    estimateGas(new_address: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface MigrationsContract {
  new: (options?: TransactionOptions) => Promise<MigrationsInstance>
  deployed(): Promise<MigrationsInstance>
  at(address: string): MigrationsInstance
}

export interface MiniMeTokenInstance extends ContractInstance {
  name: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  creationBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  decimals: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newController: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newController: Address, options?: TransactionOptions): Promise<number>
  }
  version: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  parentToken: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  symbol: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transfersEnabled: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  parentSnapShotBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenFactory: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  ClaimedTokens: Web3.EventFilterCreator<{ token: Address; controller: Address; amount: UInt }>

  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; amount: UInt }>

  NewCloneToken: Web3.EventFilterCreator<{ cloneToken: Address; snapshotBlock: UInt }>

  Approval: Web3.EventFilterCreator<{ owner: Address; spender: Address; amount: UInt }>

  transfer: {
    (to: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  approve: {
    (spender: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, spender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, options?: TransactionOptions): Promise<number>
  }
  approveAndCall: {
    (spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<number>
  }
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  balanceOfAt: {
    (owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<number>
  }
  totalSupplyAt: {
    (blockNumber: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(blockNumber: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(blockNumber: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(blockNumber: UInt, options?: TransactionOptions): Promise<number>
  }
  createCloneToken: {
    (
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>
    sendTransaction(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  destroyTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  enableTransfers: {
    (transfersEnabled: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(transfersEnabled: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(transfersEnabled: boolean, options?: TransactionOptions): Promise<string>
    estimateGas(transfersEnabled: boolean, options?: TransactionOptions): Promise<number>
  }
  claimTokens: {
    (token: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(token: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(token: Address, options?: TransactionOptions): Promise<string>
    estimateGas(token: Address, options?: TransactionOptions): Promise<number>
  }
}

export interface MiniMeTokenContract {
  new: (
    tokenFactory: Address,
    parentToken: Address,
    parentSnapShotBlock: UInt,
    tokenName: string,
    decimalUnits: UInt,
    tokenSymbol: string,
    transfersEnabled: boolean,
    options?: TransactionOptions
  ) => Promise<MiniMeTokenInstance>
  deployed(): Promise<MiniMeTokenInstance>
  at(address: string): MiniMeTokenInstance
}

export interface MiniMeTokenFactoryInstance extends ContractInstance {
  createCloneToken: {
    (
      parentToken: Address,
      snapshotBlock: UInt,
      tokenName: string,
      decimalUnits: UInt,
      tokenSymbol: string,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      parentToken: Address,
      snapshotBlock: UInt,
      tokenName: string,
      decimalUnits: UInt,
      tokenSymbol: string,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>
    sendTransaction(
      parentToken: Address,
      snapshotBlock: UInt,
      tokenName: string,
      decimalUnits: UInt,
      tokenSymbol: string,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      parentToken: Address,
      snapshotBlock: UInt,
      tokenName: string,
      decimalUnits: UInt,
      tokenSymbol: string,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<number>
  }
}

export interface MiniMeTokenFactoryContract {
  new: (options?: TransactionOptions) => Promise<MiniMeTokenFactoryInstance>
  deployed(): Promise<MiniMeTokenFactoryInstance>
  at(address: string): MiniMeTokenFactoryInstance
}

export interface MiniMeVestedTokenInstance extends ContractInstance {
  name: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  approve: {
    (spender: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  creationBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  canCreateGrants: {
    (unnamed11: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed11: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed11: Address, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed11: Address, options?: TransactionOptions): Promise<number>
  }
  grants: {
    (unnamed12: Address, unnamed13: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      unnamed12: Address,
      unnamed13: UInt,
      options?: TransactionOptions
    ): Promise<[Address, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, boolean, boolean]>
    sendTransaction(unnamed12: Address, unnamed13: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed12: Address, unnamed13: UInt, options?: TransactionOptions): Promise<number>
  }
  decimals: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newController: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newController: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newController: Address, options?: TransactionOptions): Promise<number>
  }
  balanceOfAt: {
    (owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<number>
  }
  version: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  createCloneToken: {
    (
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>
    sendTransaction(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  parentToken: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  generateTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  symbol: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<string>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  totalSupplyAt: {
    (blockNumber: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(blockNumber: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(blockNumber: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(blockNumber: UInt, options?: TransactionOptions): Promise<number>
  }
  transfersEnabled: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  parentSnapShotBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  approveAndCall: {
    (spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, amount: UInt, extraData: string, options?: TransactionOptions): Promise<number>
  }
  destroyTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, spender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, options?: TransactionOptions): Promise<number>
  }
  claimTokens: {
    (token: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(token: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(token: Address, options?: TransactionOptions): Promise<string>
    estimateGas(token: Address, options?: TransactionOptions): Promise<number>
  }
  vestingWhitelister: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  tokenFactory: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  enableTransfers: {
    (transfersEnabled: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(transfersEnabled: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(transfersEnabled: boolean, options?: TransactionOptions): Promise<string>
    estimateGas(transfersEnabled: boolean, options?: TransactionOptions): Promise<number>
  }
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  NewTokenGrant: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt; grantId: UInt }>

  ClaimedTokens: Web3.EventFilterCreator<{ token: Address; controller: Address; amount: UInt }>

  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; amount: UInt }>

  NewCloneToken: Web3.EventFilterCreator<{ cloneToken: Address; snapshotBlock: UInt }>

  Approval: Web3.EventFilterCreator<{ owner: Address; spender: Address; amount: UInt }>

  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  spendableBalanceOf: {
    (holder: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, options?: TransactionOptions): Promise<number>
  }
  grantVestedTokens: {
    (
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<number>
  }
  setCanCreateGrants: {
    (addr: Address, allowed: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(addr: Address, allowed: boolean, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(addr: Address, allowed: boolean, options?: TransactionOptions): Promise<string>
    estimateGas(addr: Address, allowed: boolean, options?: TransactionOptions): Promise<number>
  }
  changeVestingWhitelister: {
    (newWhitelister: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newWhitelister: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newWhitelister: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newWhitelister: Address, options?: TransactionOptions): Promise<number>
  }
  revokeTokenGrant: {
    (holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, receiver: Address, grantId: UInt, options?: TransactionOptions): Promise<number>
  }
  tokenGrantsCount: {
    (holder: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, options?: TransactionOptions): Promise<number>
  }
  tokenGrant: {
    (holder: Address, grantId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(
      holder: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<[Address, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, BigNumber.BigNumber, boolean, boolean]>
    sendTransaction(holder: Address, grantId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, grantId: UInt, options?: TransactionOptions): Promise<number>
  }
  lastTokenIsTransferableDate: {
    (holder: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, options?: TransactionOptions): Promise<number>
  }
  transferableTokens: {
    (holder: Address, time: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(holder: Address, time: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(holder: Address, time: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(holder: Address, time: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface MiniMeVestedTokenContract {
  new: (
    tokenFactory: Address,
    parentToken: Address,
    parentSnapShotBlock: UInt,
    tokenName: string,
    decimalUnits: UInt,
    tokenSymbol: string,
    transfersEnabled: boolean,
    options?: TransactionOptions
  ) => Promise<MiniMeVestedTokenInstance>
  deployed(): Promise<MiniMeVestedTokenInstance>
  at(address: string): MiniMeVestedTokenInstance
}

export interface MockBLTInstance extends ContractInstance {
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  decreaseApproval: {
    (spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<number>
  }
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  increaseApproval: {
    (spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, spender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, options?: TransactionOptions): Promise<number>
  }

  Gift: Web3.EventFilterCreator<{ recipient: Address }>

  Approval: Web3.EventFilterCreator<{ owner: Address; spender: Address; value: UInt }>

  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt }>

  gift: {
    (recipient: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(recipient: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(recipient: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(recipient: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface MockBLTContract {
  new: (options?: TransactionOptions) => Promise<MockBLTInstance>
  deployed(): Promise<MockBLTInstance>
  at(address: string): MockBLTInstance
}

export interface OwnableInstance extends ContractInstance {
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
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
  paused: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  Pause: Web3.EventFilterCreator<{}>

  Unpause: Web3.EventFilterCreator<{}>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

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

export interface PollInstance extends ContractInstance {
  endTime: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  signingLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  votes: {
    (unnamed14: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed14: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(unnamed14: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed14: UInt, options?: TransactionOptions): Promise<number>
  }
  startTime: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registry: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  pollAdmin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
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
    (unnamed15: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed15: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed15: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed15: string, options?: TransactionOptions): Promise<number>
  }

  VoteCast: Web3.EventFilterCreator<{ voter: Address; choice: UInt }>

  vote: {
    (choice: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(choice: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(choice: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(choice: UInt, options?: TransactionOptions): Promise<number>
  }
  voteFor: {
    (choice: UInt, voter: Address, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(choice: UInt, voter: Address, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(choice: UInt, voter: Address, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<string>
    estimateGas(choice: UInt, voter: Address, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<number>
  }
}

export interface PollContract {
  new: (
    ipfsHash: string,
    numChoices: UInt,
    startTime: UInt,
    endTime: UInt,
    author: Address,
    registry: Address,
    signingLogic: Address,
    pollAdmin: Address,
    options?: TransactionOptions
  ) => Promise<PollInstance>
  deployed(): Promise<PollInstance>
  at(address: string): PollInstance
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
  generateRequestAttestationSchemaHash: {
    (
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateAddAddressSchemaHash: {
    (senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<number>
  }
  generateReleaseTokensSchemaHash: {
    (sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<number>
  }
  generateAttestForDelegationSchemaHash: {
    (
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateContestForDelegationSchemaHash: {
    (requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<number>
  }
  generateStakeForDelegationSchemaHash: {
    (
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateRevokeStakeForDelegationSchemaHash: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  generateVoteForDelegationSchemaHash: {
    (choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<string>
    sendTransaction(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<string>
    estimateGas(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<number>
  }
  generateLockupTokensDelegationSchemaHash: {
    (sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<number>
  }
  recoverSigner: {
    (hash: string, sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(hash: string, sig: string, options?: TransactionOptions): Promise<Address>
    sendTransaction(hash: string, sig: string, options?: TransactionOptions): Promise<string>
    estimateGas(hash: string, sig: string, options?: TransactionOptions): Promise<number>
  }
}

export interface SigningLogicContract {
  new: (options?: TransactionOptions) => Promise<SigningLogicInstance>
  deployed(): Promise<SigningLogicInstance>
  at(address: string): SigningLogicInstance
}

export interface SigningLogicInterfaceInstance extends ContractInstance {
  recoverSigner: {
    (hash: string, sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(hash: string, sig: string, options?: TransactionOptions): Promise<Address>
    sendTransaction(hash: string, sig: string, options?: TransactionOptions): Promise<string>
    estimateGas(hash: string, sig: string, options?: TransactionOptions): Promise<number>
  }
  generateRequestAttestationSchemaHash: {
    (
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateAttestForDelegationSchemaHash: {
    (
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateContestForDelegationSchemaHash: {
    (requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<number>
  }
  generateStakeForDelegationSchemaHash: {
    (
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateRevokeStakeForDelegationSchemaHash: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  generateAddAddressSchemaHash: {
    (senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<number>
  }
  generateVoteForDelegationSchemaHash: {
    (choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<string>
    sendTransaction(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<string>
    estimateGas(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<number>
  }
  generateReleaseTokensSchemaHash: {
    (sender: Address, receiver: Address, amount: UInt, uuid: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, receiver: Address, amount: UInt, uuid: string, options?: TransactionOptions): Promise<string>
    sendTransaction(sender: Address, receiver: Address, amount: UInt, uuid: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, receiver: Address, amount: UInt, uuid: string, options?: TransactionOptions): Promise<number>
  }
  generateLockupTokensDelegationSchemaHash: {
    (sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<number>
  }
}

export interface SigningLogicInterfaceContract {
  new: (options?: TransactionOptions) => Promise<SigningLogicInterfaceInstance>
  deployed(): Promise<SigningLogicInterfaceInstance>
  at(address: string): SigningLogicInterfaceInstance
}

export interface SigningLogicLegacyInstance extends ContractInstance {
  generateRequestAttestationSchemaHash: {
    (
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      attester: Address,
      requester: Address,
      dataHash: string,
      typeIds: UInt[],
      nonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateAddAddressSchemaHash: {
    (senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(senderAddress: Address, nonce: string, options?: TransactionOptions): Promise<number>
  }
  generateReleaseTokensSchemaHash: {
    (sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, receiver: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<number>
  }
  generateAttestForDelegationSchemaHash: {
    (
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      requester: Address,
      reward: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateContestForDelegationSchemaHash: {
    (requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(requester: Address, reward: UInt, paymentNonce: string, options?: TransactionOptions): Promise<number>
  }
  generateStakeForDelegationSchemaHash: {
    (
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    sendTransaction(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      subject: Address,
      value: UInt,
      paymentNonce: string,
      dataHash: string,
      typeIds: UInt[],
      requestNonce: string,
      stakeDuration: UInt,
      options?: TransactionOptions
    ): Promise<number>
  }
  generateRevokeStakeForDelegationSchemaHash: {
    (subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    sendTransaction(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(subjectId: UInt, attestationId: UInt, options?: TransactionOptions): Promise<number>
  }
  generateVoteForDelegationSchemaHash: {
    (choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<string>
    sendTransaction(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<string>
    estimateGas(choice: UInt, voter: Address, nonce: string, poll: Address, options?: TransactionOptions): Promise<number>
  }
  generateLockupTokensDelegationSchemaHash: {
    (sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    sendTransaction(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, amount: UInt, nonce: string, options?: TransactionOptions): Promise<number>
  }
  recoverSigner: {
    (hash: string, sig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(hash: string, sig: string, options?: TransactionOptions): Promise<Address>
    sendTransaction(hash: string, sig: string, options?: TransactionOptions): Promise<string>
    estimateGas(hash: string, sig: string, options?: TransactionOptions): Promise<number>
  }
}

export interface SigningLogicLegacyContract {
  new: (options?: TransactionOptions) => Promise<SigningLogicLegacyInstance>
  deployed(): Promise<SigningLogicLegacyInstance>
  at(address: string): SigningLogicLegacyInstance
}

export interface StandardTokenInstance extends ContractInstance {
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
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  Approval: Web3.EventFilterCreator<{ owner: Address; spender: Address; value: UInt }>

  Transfer: Web3.EventFilterCreator<{ from: Address; to: Address; value: UInt }>

  transferFrom: {
    (from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, value: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, value: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, value: UInt, options?: TransactionOptions): Promise<number>
  }
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(owner: Address, spender: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, options?: TransactionOptions): Promise<number>
  }
  increaseApproval: {
    (spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, addedValue: UInt, options?: TransactionOptions): Promise<number>
  }
  decreaseApproval: {
    (spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(spender: Address, subtractedValue: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface StandardTokenContract {
  new: (options?: TransactionOptions) => Promise<StandardTokenInstance>
  deployed(): Promise<StandardTokenInstance>
  at(address: string): StandardTokenInstance
}

export interface TokenControllerInstance extends ContractInstance {
  proxyPayment: {
    (owner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, options?: TransactionOptions): Promise<number>
  }
  onTransfer: {
    (from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(from: Address, to: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  onApprove: {
    (owner: Address, spender: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(owner: Address, spender: Address, amount: UInt, options?: TransactionOptions): Promise<boolean>
    sendTransaction(owner: Address, spender: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(owner: Address, spender: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
}

export interface TokenControllerContract {
  new: (options?: TransactionOptions) => Promise<TokenControllerInstance>
  deployed(): Promise<TokenControllerInstance>
  at(address: string): TokenControllerInstance
}

export interface TokenEscrowMarketplaceInstance extends ContractInstance {
  attestationLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  unpause: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  signingLogic: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  paused: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<boolean>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  registry: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
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
  marketplaceAdmin: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newOwner: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newOwner: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newOwner: Address, options?: TransactionOptions): Promise<number>
  }
  tokenEscrow: {
    (unnamed16: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed16: UInt, options?: TransactionOptions): Promise<BigNumber.BigNumber>
    sendTransaction(unnamed16: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed16: UInt, options?: TransactionOptions): Promise<number>
  }
  usedSignatures: {
    (unnamed17: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed17: string, options?: TransactionOptions): Promise<boolean>
    sendTransaction(unnamed17: string, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed17: string, options?: TransactionOptions): Promise<number>
  }
  token: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(options?: TransactionOptions): Promise<Address>
    sendTransaction(options?: TransactionOptions): Promise<string>
    estimateGas(options?: TransactionOptions): Promise<number>
  }

  TokenMarketplaceWithdrawal: Web3.EventFilterCreator<{ subject: UInt; amount: UInt }>

  TokenMarketplaceEscrowPayment: Web3.EventFilterCreator<{ escrowPayer: UInt; escrowPayee: Address; amount: UInt }>

  TokenMarketplaceDeposit: Web3.EventFilterCreator<{ escrowPayer: UInt; amount: UInt }>

  SigningLogicChanged: Web3.EventFilterCreator<{ oldSigningLogic: Address; newSigningLogic: Address }>

  AttestationLogicChanged: Web3.EventFilterCreator<{ oldAttestationLogic: Address; newAttestationLogic: Address }>

  AccountRegistryChanged: Web3.EventFilterCreator<{ oldRegistry: Address; newRegistry: Address }>

  MarketplaceAdminChanged: Web3.EventFilterCreator<{ oldMarketplaceAdmin: Address; newMarketplaceAdmin: Address }>

  Pause: Web3.EventFilterCreator<{}>

  Unpause: Web3.EventFilterCreator<{}>

  OwnershipTransferred: Web3.EventFilterCreator<{ previousOwner: Address; newOwner: Address }>

  setMarketplaceAdmin: {
    (newMarketplaceAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newMarketplaceAdmin: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newMarketplaceAdmin: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newMarketplaceAdmin: Address, options?: TransactionOptions): Promise<number>
  }
  setSigningLogic: {
    (newSigningLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newSigningLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newSigningLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newSigningLogic: Address, options?: TransactionOptions): Promise<number>
  }
  setAttestationLogic: {
    (newAttestationLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newAttestationLogic: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newAttestationLogic: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newAttestationLogic: Address, options?: TransactionOptions): Promise<number>
  }
  setAccountRegistry: {
    (newRegistry: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(newRegistry: Address, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(newRegistry: Address, options?: TransactionOptions): Promise<string>
    estimateGas(newRegistry: Address, options?: TransactionOptions): Promise<number>
  }
  moveTokensToEscrowLockupFor: {
    (sender: Address, amount: UInt, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(sender: Address, amount: UInt, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(sender: Address, amount: UInt, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<string>
    estimateGas(sender: Address, amount: UInt, nonce: string, delegationSig: string, options?: TransactionOptions): Promise<number>
  }
  moveTokensToEscrowLockup: {
    (amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(amount: UInt, options?: TransactionOptions): Promise<number>
  }
  releaseTokensFromEscrow: {
    (amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(amount: UInt, options?: TransactionOptions): Promise<number>
  }
  releaseTokensFromEscrowFor: {
    (payer: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(payer: Address, amount: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    sendTransaction(payer: Address, amount: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(payer: Address, amount: UInt, options?: TransactionOptions): Promise<number>
  }
  requestTokenPayment: {
    (payer: Address, receiver: Address, amount: UInt, nonce: string, releaseSig: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >
    call(
      payer: Address,
      receiver: Address,
      amount: UInt,
      nonce: string,
      releaseSig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    sendTransaction(payer: Address, receiver: Address, amount: UInt, nonce: string, releaseSig: string, options?: TransactionOptions): Promise<string>
    estimateGas(payer: Address, receiver: Address, amount: UInt, nonce: string, releaseSig: string, options?: TransactionOptions): Promise<number>
  }
}

export interface TokenEscrowMarketplaceContract {
  new: (
    token: Address,
    registry: Address,
    signingLogic: Address,
    attestationLogic: Address,
    options?: TransactionOptions
  ) => Promise<TokenEscrowMarketplaceInstance>
  deployed(): Promise<TokenEscrowMarketplaceInstance>
  at(address: string): TokenEscrowMarketplaceInstance
}

export interface VotingCenterInstance extends ContractInstance {
  polls: {
    (unnamed18: UInt, options?: TransactionOptions): Promise<Web3.TransactionReceipt>
    call(unnamed18: UInt, options?: TransactionOptions): Promise<Address>
    sendTransaction(unnamed18: UInt, options?: TransactionOptions): Promise<string>
    estimateGas(unnamed18: UInt, options?: TransactionOptions): Promise<number>
  }
  PollCreated: Web3.EventFilterCreator<{ poll: Address; author: Address }>

  createPoll: {
    (
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      registry: Address,
      signingLogic: Address,
      pollAdmin: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>
    call(
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      registry: Address,
      signingLogic: Address,
      pollAdmin: Address,
      options?: TransactionOptions
    ): Promise<Address>
    sendTransaction(
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      registry: Address,
      signingLogic: Address,
      pollAdmin: Address,
      options?: TransactionOptions
    ): Promise<string>
    estimateGas(
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      registry: Address,
      signingLogic: Address,
      pollAdmin: Address,
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
