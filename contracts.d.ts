import * as Web3 from "web3";
import * as BigNumber from "bignumber.js";

type Address = string;
type TransactionOptions = Partial<Transaction>;
type UInt = number | BigNumber.BigNumber;

interface Transaction {
  hash: string,
  nonce: number,
  blockHash: string | null,
  blockNumber: number | null,
  transactionIndex: number | null,
  from: Address | ContractInstance,
  to: string | null,
  value: UInt,
  gasPrice: UInt,
  gas: number,
  input: string
}

interface ContractInstance {
  address: string,
  sendTransaction(options?: TransactionOptions): Promise<void>
}

export interface AccountRegistryInstance extends ContractInstance {
  inviteCollateralizer(options?: TransactionOptions): Promise<Address>,
  invite(recipient: Address, options?: TransactionOptions): Promise<void>,
  owner(options?: TransactionOptions): Promise<Address>,
  createAccount(options?: TransactionOptions): Promise<void>,
  blt(options?: TransactionOptions): Promise<Address>,
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>
}

export interface ApproveAndCallFallBackInstance extends ContractInstance {
  receiveApproval(
    from: Address,
    amount: UInt,
    token: Address,
    data: string,
    options?: TransactionOptions
  ): Promise<void>
}

export interface BLTInstance extends ContractInstance {
  tokenGrantsCount(
    holder: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  name(options?: TransactionOptions): Promise<string>,
  approve(
    spender: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  spendableBalanceOf(
    holder: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  creationBlock(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  totalSupply(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  setCanCreateGrants(
    addr: Address,
    allowed: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  transferFrom(
    from: Address,
    to: Address,
    value: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  grants(
    unnamed0: Address,
    unnamed1: UInt,
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
  >,
  decimals(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  changeController(
    newController: Address,
    options?: TransactionOptions
  ): Promise<void>,
  balanceOfAt(
    owner: Address,
    blockNumber: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  version(options?: TransactionOptions): Promise<string>,
  tokenGrant(
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
  >,
  createCloneToken(
    cloneTokenName: string,
    cloneDecimalUnits: UInt,
    cloneTokenSymbol: string,
    snapshotBlock: UInt,
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<Address>,
  lastTokenIsTransferableDate(
    holder: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  balanceOf(
    owner: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  parentToken(options?: TransactionOptions): Promise<Address>,
  generateTokens(
    owner: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  symbol(options?: TransactionOptions): Promise<string>,
  grantVestedTokens(
    to: Address,
    value: UInt,
    start: UInt,
    cliff: UInt,
    vesting: UInt,
    revokable: boolean,
    burnsOnRevoke: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  totalSupplyAt(
    blockNumber: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  transfer(
    to: Address,
    value: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  revokeTokenGrant(
    holder: Address,
    receiver: Address,
    grantId: UInt,
    options?: TransactionOptions
  ): Promise<void>,
  transfersEnabled(options?: TransactionOptions): Promise<boolean>,
  parentSnapShotBlock(
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  approveAndCall(
    spender: Address,
    amount: UInt,
    extraData: string,
    options?: TransactionOptions
  ): Promise<boolean>,
  transferableTokens(
    holder: Address,
    time: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  destroyTokens(
    owner: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  allowance(
    owner: Address,
    spender: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  claimTokens(token: Address, options?: TransactionOptions): Promise<void>,
  tokenFactory(options?: TransactionOptions): Promise<Address>,
  enableTransfers(
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  controller(options?: TransactionOptions): Promise<Address>,
  changeVestingWhitelister(
    newWhitelister: Address,
    options?: TransactionOptions
  ): Promise<void>
}

export interface ControlledInstance extends ContractInstance {
  changeController(
    newController: Address,
    options?: TransactionOptions
  ): Promise<void>,
  controller(options?: TransactionOptions): Promise<Address>
}

export interface ConvertLibInstance extends ContractInstance {
  convert(
    amount: UInt,
    conversionRate: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>
}

export interface InviteCollateralizerInstance extends ContractInstance {
  registry(options?: TransactionOptions): Promise<Address>,
  owner(options?: TransactionOptions): Promise<Address>,
  blt(options?: TransactionOptions): Promise<Address>,
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>
}

export interface MathInstance extends ContractInstance {}

export interface MetaCoinInstance extends ContractInstance {
  getBalanceInEth(
    addr: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  sendCoin(
    receiver: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  getBalance(
    addr: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>
}

export interface MigrationsInstance extends ContractInstance {
  upgrade(new_address: Address, options?: TransactionOptions): Promise<void>,
  last_completed_migration(
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  owner(options?: TransactionOptions): Promise<Address>,
  setCompleted(completed: UInt, options?: TransactionOptions): Promise<void>
}

export interface MiniMeTokenInstance extends ContractInstance {
  name(options?: TransactionOptions): Promise<string>,
  approve(
    spender: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  creationBlock(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  totalSupply(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  transferFrom(
    from: Address,
    to: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  decimals(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  changeController(
    newController: Address,
    options?: TransactionOptions
  ): Promise<void>,
  balanceOfAt(
    owner: Address,
    blockNumber: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  version(options?: TransactionOptions): Promise<string>,
  createCloneToken(
    cloneTokenName: string,
    cloneDecimalUnits: UInt,
    cloneTokenSymbol: string,
    snapshotBlock: UInt,
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<Address>,
  balanceOf(
    owner: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  parentToken(options?: TransactionOptions): Promise<Address>,
  generateTokens(
    owner: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  symbol(options?: TransactionOptions): Promise<string>,
  totalSupplyAt(
    blockNumber: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  transfer(
    to: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  transfersEnabled(options?: TransactionOptions): Promise<boolean>,
  parentSnapShotBlock(
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  approveAndCall(
    spender: Address,
    amount: UInt,
    extraData: string,
    options?: TransactionOptions
  ): Promise<boolean>,
  destroyTokens(
    owner: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  allowance(
    owner: Address,
    spender: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  claimTokens(token: Address, options?: TransactionOptions): Promise<void>,
  tokenFactory(options?: TransactionOptions): Promise<Address>,
  enableTransfers(
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  controller(options?: TransactionOptions): Promise<Address>
}

export interface MiniMeTokenFactoryInstance extends ContractInstance {
  createCloneToken(
    parentToken: Address,
    snapshotBlock: UInt,
    tokenName: string,
    decimalUnits: UInt,
    tokenSymbol: string,
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<Address>
}

export interface MiniMeVestedTokenInstance extends ContractInstance {
  tokenGrantsCount(
    holder: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  name(options?: TransactionOptions): Promise<string>,
  approve(
    spender: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  spendableBalanceOf(
    holder: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  creationBlock(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  totalSupply(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  setCanCreateGrants(
    addr: Address,
    allowed: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  transferFrom(
    from: Address,
    to: Address,
    value: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  grants(
    unnamed2: Address,
    unnamed3: UInt,
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
  >,
  decimals(options?: TransactionOptions): Promise<BigNumber.BigNumber>,
  changeController(
    newController: Address,
    options?: TransactionOptions
  ): Promise<void>,
  balanceOfAt(
    owner: Address,
    blockNumber: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  version(options?: TransactionOptions): Promise<string>,
  tokenGrant(
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
  >,
  createCloneToken(
    cloneTokenName: string,
    cloneDecimalUnits: UInt,
    cloneTokenSymbol: string,
    snapshotBlock: UInt,
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<Address>,
  lastTokenIsTransferableDate(
    holder: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  balanceOf(
    owner: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  parentToken(options?: TransactionOptions): Promise<Address>,
  generateTokens(
    owner: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  symbol(options?: TransactionOptions): Promise<string>,
  grantVestedTokens(
    to: Address,
    value: UInt,
    start: UInt,
    cliff: UInt,
    vesting: UInt,
    revokable: boolean,
    burnsOnRevoke: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  totalSupplyAt(
    blockNumber: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  transfer(
    to: Address,
    value: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  revokeTokenGrant(
    holder: Address,
    receiver: Address,
    grantId: UInt,
    options?: TransactionOptions
  ): Promise<void>,
  transfersEnabled(options?: TransactionOptions): Promise<boolean>,
  parentSnapShotBlock(
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  approveAndCall(
    spender: Address,
    amount: UInt,
    extraData: string,
    options?: TransactionOptions
  ): Promise<boolean>,
  transferableTokens(
    holder: Address,
    time: UInt,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  destroyTokens(
    owner: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  allowance(
    owner: Address,
    spender: Address,
    options?: TransactionOptions
  ): Promise<BigNumber.BigNumber>,
  claimTokens(token: Address, options?: TransactionOptions): Promise<void>,
  tokenFactory(options?: TransactionOptions): Promise<Address>,
  enableTransfers(
    transfersEnabled: boolean,
    options?: TransactionOptions
  ): Promise<void>,
  controller(options?: TransactionOptions): Promise<Address>,
  changeVestingWhitelister(
    newWhitelister: Address,
    options?: TransactionOptions
  ): Promise<void>
}

export interface OwnableInstance extends ContractInstance {
  owner(options?: TransactionOptions): Promise<Address>,
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>
}

export interface SafeMathInstance extends ContractInstance {}

export interface TokenControllerInstance extends ContractInstance {
  onTransfer(
    from: Address,
    to: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  onApprove(
    owner: Address,
    spender: Address,
    amount: UInt,
    options?: TransactionOptions
  ): Promise<boolean>,
  proxyPayment(owner: Address, options?: TransactionOptions): Promise<boolean>
}
