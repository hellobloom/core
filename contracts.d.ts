import * as Web3 from "web3";
import * as BigNumber from "bignumber.js";

type Address = string;
type TransactionOptions = Partial<Transaction>;
type UInt = number | BigNumber.BigNumber;

interface Transaction {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: Address | ContractInstance;
  to: string | null;
  value: UInt;
  gasPrice: UInt;
  gas: number;
  input: string;
}

interface ContractInstance {
  address: string;
  sendTransaction(options?: TransactionOptions): Promise<void>;
}

export interface AccountRegistryInstance extends ContractInstance {
  setInviteCollateralizer: {
    (newInviteCollateralizer: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newInviteCollateralizer: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  inviteCollateralizer: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  setInviteAdmin: {
    (newInviteAdmin: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newInviteAdmin: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  createInvite: {
    (sig: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      sig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  accounts: {
    (unnamed0: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(unnamed0: Address, options?: TransactionOptions): Promise<boolean>;
  };
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  invites: {
    (unnamed1: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      unnamed1: Address,
      options?: TransactionOptions
    ): Promise<[Address, Address]>;
  };
  createAccount: {
    (newUser: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newUser: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  blt: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  acceptInvite: {
    (sig: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      sig: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface AccountRegistryContract {
  new: (
    blt: Address,
    inviteCollateralizer: Address
  ) => Promise<AccountRegistryInstance>;
  deployed(): Promise<AccountRegistryInstance>;
  at(address: string): AccountRegistryInstance;
}

export interface ApproveAndCallFallBackInstance extends ContractInstance {
  receiveApproval: {
    (
      from: Address,
      amount: UInt,
      token: Address,
      data: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      from: Address,
      amount: UInt,
      token: Address,
      data: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface ApproveAndCallFallBackContract {
  new: () => Promise<ApproveAndCallFallBackInstance>;
  deployed(): Promise<ApproveAndCallFallBackInstance>;
  at(address: string): ApproveAndCallFallBackInstance;
}

export interface BLTInstance extends ContractInstance {
  tokenGrantsCount: {
    (holder: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  name: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  approve: {
    (spender: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      spender: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  spendableBalanceOf: {
    (holder: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  creationBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  canCreateGrants: {
    (unnamed2: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(unnamed2: Address, options?: TransactionOptions): Promise<boolean>;
  };
  setCanCreateGrants: {
    (addr: Address, allowed: boolean, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      addr: Address,
      allowed: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  transferFrom: {
    (
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  grants: {
    (unnamed3: Address, unnamed4: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      unnamed3: Address,
      unnamed4: UInt,
      options?: TransactionOptions
    ): Promise<
      [
        Address,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        boolean,
        boolean
      ]
    >;
  };
  decimals: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newController: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  balanceOfAt: {
    (owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      blockNumber: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  version: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  tokenGrant: {
    (holder: Address, grantId: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<
      [
        Address,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        boolean,
        boolean
      ]
    >;
  };
  createCloneToken: {
    (
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>;
  };
  lastTokenIsTransferableDate: {
    (holder: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  parentToken: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  generateTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  symbol: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
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
    ): Promise<Web3.TransactionReceipt>;
    call(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  totalSupplyAt: {
    (blockNumber: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      blockNumber: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  revokeTokenGrant: {
    (
      holder: Address,
      receiver: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      holder: Address,
      receiver: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  transfersEnabled: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<boolean>;
  };
  parentSnapShotBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  approveAndCall: {
    (
      spender: Address,
      amount: UInt,
      extraData: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      spender: Address,
      amount: UInt,
      extraData: string,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  transferableTokens: {
    (holder: Address, time: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      time: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  destroyTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  claimTokens: {
    (token: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      token: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  vestingWhitelister: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  tokenFactory: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  enableTransfers: {
    (transfersEnabled: boolean, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  changeVestingWhitelister: {
    (newWhitelister: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newWhitelister: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface BLTContract {
  new: (tokenFactory: Address) => Promise<BLTInstance>;
  deployed(): Promise<BLTInstance>;
  at(address: string): BLTInstance;
}

export interface ControlledInstance extends ContractInstance {
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newController: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
}

export interface ControlledContract {
  new: () => Promise<ControlledInstance>;
  deployed(): Promise<ControlledInstance>;
  at(address: string): ControlledInstance;
}

export interface ConvertLibInstance extends ContractInstance {
  convert: {
    (amount: UInt, conversionRate: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      amount: UInt,
      conversionRate: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
}

export interface ConvertLibContract {
  new: () => Promise<ConvertLibInstance>;
  deployed(): Promise<ConvertLibInstance>;
  at(address: string): ConvertLibInstance;
}

export interface DependentOnIPFSInstance extends ContractInstance {}

export interface DependentOnIPFSContract {
  new: () => Promise<DependentOnIPFSInstance>;
  deployed(): Promise<DependentOnIPFSInstance>;
  at(address: string): DependentOnIPFSInstance;
}

export interface ECRecoveryInstance extends ContractInstance {
  recover: {
    (hash: string, sig: string, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      hash: string,
      sig: string,
      options?: TransactionOptions
    ): Promise<Address>;
  };
}

export interface ECRecoveryContract {
  new: () => Promise<ECRecoveryInstance>;
  deployed(): Promise<ECRecoveryInstance>;
  at(address: string): ECRecoveryInstance;
}

export interface ERC20Instance extends ContractInstance {
  approve: {
    (spender: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      spender: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  transferFrom: {
    (
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  balanceOf: {
    (who: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      who: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
}

export interface ERC20Contract {
  new: () => Promise<ERC20Instance>;
  deployed(): Promise<ERC20Instance>;
  at(address: string): ERC20Instance;
}

export interface ERC20BasicInstance extends ContractInstance {
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  balanceOf: {
    (who: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      who: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
}

export interface ERC20BasicContract {
  new: () => Promise<ERC20BasicInstance>;
  deployed(): Promise<ERC20BasicInstance>;
  at(address: string): ERC20BasicInstance;
}

export interface InviteCollateralizerInstance extends ContractInstance {
  seizedTokensWallet: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  changeCollateralTaker: {
    (newCollateralTaker: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newCollateralTaker: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  changeCollateralAmount: {
    (newAmount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newAmount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  changeSeizedTokensWallet: {
    (newSeizedTokensWallet: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newSeizedTokensWallet: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  collateralizations: {
    (unnamed5: Address, unnamed6: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      unnamed5: Address,
      unnamed6: UInt,
      options?: TransactionOptions
    ): Promise<[BigNumber.BigNumber, BigNumber.BigNumber, boolean]>;
  };
  reclaim: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<boolean>;
  };
  changeCollateralSeizer: {
    (newCollateralSeizer: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newCollateralSeizer: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  collateralAmount: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  blt: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  takeCollateral: {
    (owner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(owner: Address, options?: TransactionOptions): Promise<boolean>;
  };
  seize: {
    (
      subject: Address,
      collateralId: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      subject: Address,
      collateralId: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface InviteCollateralizerContract {
  new: (
    blt: Address,
    seizedTokensWallet: Address
  ) => Promise<InviteCollateralizerInstance>;
  deployed(): Promise<InviteCollateralizerInstance>;
  at(address: string): InviteCollateralizerInstance;
}

export interface MathInstance extends ContractInstance {}

export interface MathContract {
  new: () => Promise<MathInstance>;
  deployed(): Promise<MathInstance>;
  at(address: string): MathInstance;
}

export interface MetaCoinInstance extends ContractInstance {
  getBalanceInEth: {
    (addr: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      addr: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  sendCoin: {
    (receiver: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      receiver: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  getBalance: {
    (addr: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      addr: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
}

export interface MetaCoinContract {
  new: () => Promise<MetaCoinInstance>;
  deployed(): Promise<MetaCoinInstance>;
  at(address: string): MetaCoinInstance;
}

export interface MigrationsInstance extends ContractInstance {
  upgrade: {
    (new_address: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      new_address: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  last_completed_migration: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  setCompleted: {
    (completed: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      completed: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface MigrationsContract {
  new: () => Promise<MigrationsInstance>;
  deployed(): Promise<MigrationsInstance>;
  at(address: string): MigrationsInstance;
}

export interface MiniMeTokenInstance extends ContractInstance {
  name: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  approve: {
    (spender: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      spender: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  creationBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  transferFrom: {
    (
      from: Address,
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      from: Address,
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  decimals: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newController: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  balanceOfAt: {
    (owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      blockNumber: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  version: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  createCloneToken: {
    (
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>;
  };
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  parentToken: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  generateTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  symbol: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  totalSupplyAt: {
    (blockNumber: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      blockNumber: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  transfer: {
    (to: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  transfersEnabled: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<boolean>;
  };
  parentSnapShotBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  approveAndCall: {
    (
      spender: Address,
      amount: UInt,
      extraData: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      spender: Address,
      amount: UInt,
      extraData: string,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  destroyTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  claimTokens: {
    (token: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      token: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  tokenFactory: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  enableTransfers: {
    (transfersEnabled: boolean, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
}

export interface MiniMeTokenContract {
  new: (
    tokenFactory: Address,
    parentToken: Address,
    parentSnapShotBlock: UInt,
    tokenName: string,
    decimalUnits: UInt,
    tokenSymbol: string,
    transfersEnabled: boolean
  ) => Promise<MiniMeTokenInstance>;
  deployed(): Promise<MiniMeTokenInstance>;
  at(address: string): MiniMeTokenInstance;
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
    ): Promise<Web3.TransactionReceipt>;
    call(
      parentToken: Address,
      snapshotBlock: UInt,
      tokenName: string,
      decimalUnits: UInt,
      tokenSymbol: string,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>;
  };
}

export interface MiniMeTokenFactoryContract {
  new: () => Promise<MiniMeTokenFactoryInstance>;
  deployed(): Promise<MiniMeTokenFactoryInstance>;
  at(address: string): MiniMeTokenFactoryInstance;
}

export interface MiniMeVestedTokenInstance extends ContractInstance {
  tokenGrantsCount: {
    (holder: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  name: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  approve: {
    (spender: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      spender: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  spendableBalanceOf: {
    (holder: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  creationBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  totalSupply: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  canCreateGrants: {
    (unnamed7: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(unnamed7: Address, options?: TransactionOptions): Promise<boolean>;
  };
  setCanCreateGrants: {
    (addr: Address, allowed: boolean, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      addr: Address,
      allowed: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  transferFrom: {
    (
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      from: Address,
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  grants: {
    (unnamed8: Address, unnamed9: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      unnamed8: Address,
      unnamed9: UInt,
      options?: TransactionOptions
    ): Promise<
      [
        Address,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        boolean,
        boolean
      ]
    >;
  };
  decimals: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  changeController: {
    (newController: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newController: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  balanceOfAt: {
    (owner: Address, blockNumber: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      blockNumber: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  version: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
  tokenGrant: {
    (holder: Address, grantId: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<
      [
        Address,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        BigNumber.BigNumber,
        boolean,
        boolean
      ]
    >;
  };
  createCloneToken: {
    (
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      cloneTokenName: string,
      cloneDecimalUnits: UInt,
      cloneTokenSymbol: string,
      snapshotBlock: UInt,
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Address>;
  };
  lastTokenIsTransferableDate: {
    (holder: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  balanceOf: {
    (owner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  parentToken: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  generateTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  symbol: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<string>;
  };
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
    ): Promise<Web3.TransactionReceipt>;
    call(
      to: Address,
      value: UInt,
      start: UInt,
      cliff: UInt,
      vesting: UInt,
      revokable: boolean,
      burnsOnRevoke: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  totalSupplyAt: {
    (blockNumber: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      blockNumber: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  transfer: {
    (to: Address, value: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      to: Address,
      value: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  revokeTokenGrant: {
    (
      holder: Address,
      receiver: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      holder: Address,
      receiver: Address,
      grantId: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  transfersEnabled: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<boolean>;
  };
  parentSnapShotBlock: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  approveAndCall: {
    (
      spender: Address,
      amount: UInt,
      extraData: string,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      spender: Address,
      amount: UInt,
      extraData: string,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  transferableTokens: {
    (holder: Address, time: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      holder: Address,
      time: UInt,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  destroyTokens: {
    (owner: Address, amount: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  allowance: {
    (owner: Address, spender: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      owner: Address,
      spender: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  claimTokens: {
    (token: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      token: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  vestingWhitelister: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  tokenFactory: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  enableTransfers: {
    (transfersEnabled: boolean, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      transfersEnabled: boolean,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
  controller: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  changeVestingWhitelister: {
    (newWhitelister: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newWhitelister: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface MiniMeVestedTokenContract {
  new: (
    tokenFactory: Address,
    parentToken: Address,
    parentSnapShotBlock: UInt,
    tokenName: string,
    decimalUnits: UInt,
    tokenSymbol: string,
    transfersEnabled: boolean
  ) => Promise<MiniMeVestedTokenInstance>;
  deployed(): Promise<MiniMeVestedTokenInstance>;
  at(address: string): MiniMeVestedTokenInstance;
}

export interface OwnableInstance extends ContractInstance {
  owner: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  transferOwnership: {
    (newOwner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      newOwner: Address,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface OwnableContract {
  new: () => Promise<OwnableInstance>;
  deployed(): Promise<OwnableInstance>;
  at(address: string): OwnableInstance;
}

export interface PollInstance extends ContractInstance {
  endTime: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  startTime: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  pollDataMultihash: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(
      options?: TransactionOptions
    ): Promise<[BigNumber.BigNumber, BigNumber.BigNumber, string]>;
  };
  author: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<Address>;
  };
  numChoices: {
    (options?: TransactionOptions): Promise<Web3.TransactionReceipt>;
    call(options?: TransactionOptions): Promise<BigNumber.BigNumber>;
  };
  votes: {
    (unnamed10: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      unnamed10: Address,
      options?: TransactionOptions
    ): Promise<BigNumber.BigNumber>;
  };
  vote: {
    (choice: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(
      choice: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
  };
}

export interface PollContract {
  new: (
    ipfsHash: string,
    numChoices: UInt,
    startTime: UInt,
    endTime: UInt,
    author: Address
  ) => Promise<PollInstance>;
  deployed(): Promise<PollInstance>;
  at(address: string): PollInstance;
}

export interface SafeERC20Instance extends ContractInstance {}

export interface SafeERC20Contract {
  new: () => Promise<SafeERC20Instance>;
  deployed(): Promise<SafeERC20Instance>;
  at(address: string): SafeERC20Instance;
}

export interface SafeMathInstance extends ContractInstance {}

export interface SafeMathContract {
  new: () => Promise<SafeMathInstance>;
  deployed(): Promise<SafeMathInstance>;
  at(address: string): SafeMathInstance;
}

export interface TokenControllerInstance extends ContractInstance {
  onTransfer: {
    (
      from: Address,
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      from: Address,
      to: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  onApprove: {
    (
      owner: Address,
      spender: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      owner: Address,
      spender: Address,
      amount: UInt,
      options?: TransactionOptions
    ): Promise<boolean>;
  };
  proxyPayment: {
    (owner: Address, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(owner: Address, options?: TransactionOptions): Promise<boolean>;
  };
}

export interface TokenControllerContract {
  new: () => Promise<TokenControllerInstance>;
  deployed(): Promise<TokenControllerInstance>;
  at(address: string): TokenControllerInstance;
}

export interface VotingCenterInstance extends ContractInstance {
  polls: {
    (unnamed11: UInt, options?: TransactionOptions): Promise<
      Web3.TransactionReceipt
    >;
    call(unnamed11: UInt, options?: TransactionOptions): Promise<Address>;
  };
  createPoll: {
    (
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      options?: TransactionOptions
    ): Promise<Web3.TransactionReceipt>;
    call(
      ipfsHash: string,
      numOptions: UInt,
      startTime: UInt,
      endTime: UInt,
      options?: TransactionOptions
    ): Promise<Address>;
  };
}

export interface VotingCenterContract {
  new: () => Promise<VotingCenterInstance>;
  deployed(): Promise<VotingCenterInstance>;
  at(address: string): VotingCenterInstance;
}
