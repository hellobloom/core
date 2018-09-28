interface ConstructorMember {
  inputs: FunctionMemberInput[]
  payable: false
  type: "constructor"
}

interface EventMember {
  inputs: EventMemberInput[]
  name: string
  type: "event"
}

interface FunctionMember {
  inputs: FunctionMemberInput[]
  outputs: FunctionMemberInput[]
  name: string
  constant: boolean
  payable: boolean
  type: "function"
}

interface FallbackMember {
  type: "fallback"
  payable: boolean
}

interface UnknownMember {
  type: string
}

type SolidityType = "address" | "address[]" | "bool" | "bytes" | "bytes32" | "string" | "uint8" | "uint16" | "uint64" | "uint256" | "uint256[]"

interface FunctionMemberInput {
  name: string
  type: SolidityType
}

interface EventMemberInput extends FunctionMemberInput {
  indexed: boolean
}

type Member = ConstructorMember | EventMember | FunctionMember | FallbackMember

type Abi = (EventMember | FunctionMember | ConstructorMember)[]

interface Definition {
  contractName: string
  abi: Abi
}

function generateHeader(isTruffle: boolean): string {
  let str = `
    import * as Web3 from "web3";
    import * as BigNumber from "bignumber.js";
    `

  if (isTruffle) {
    str += `
    import {SolidityEvent} from 'web3';
    `
  }

  str += `type Address = string;
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
      value: BigNumber.BigNumber
      gasPrice: BigNumber.BigNumber
      gas: number;
      input: string;
    }

    declare type ContractTest = (accounts: string[]) => void

    declare global {
      function contract(name: string, test: ContractTest): void
      var artifacts: Artifacts
      var web3: Web3
      var assert: Chai.AssertStatic
    }

    interface ContractInstance {
      address: string;
      sendTransaction(options?: TransactionOptions): Promise<void>;
`
  if (isTruffle) {
    str += `
      allEvents(options: {
        fromBlock: number
        toBlock: number | 'latest'
      }): Web3.FilterResult;
    `
  }

  str += `
    }
  `

  return str
}

function generateArtifacts(files: string[]) {
  return `
    interface Artifacts {
      ${files.map(file => {
        let definition: Definition = require(file)
        return `require(name: "${definition.contractName}"): ${definition.contractName}Contract`
      })}
    }
  `
}

function buildContract(definition: Definition, isTruffle: boolean) {
  return `
    export interface ${definition.contractName}Instance extends ContractInstance {
      ${buildMembers(definition.abi, isTruffle)}
    }

    export interface ${definition.contractName}Contract {
      new: (${buildConstructorArguments(definition.abi)}options?: TransactionOptions) => Promise<${definition.contractName}Instance>;
      deployed(): Promise<${definition.contractName}Instance>;
      at(address: string): ${definition.contractName}Instance;
    }
  `
}

function buildMembers(abi: Abi, isTruffle: boolean): string {
  return abi.map(buildMember).join("\n")
}

function buildMember(member: Member): string {
  switch (member.type) {
    case "function":
      return buildFunctionMember(member)
    case "event":
      return buildEventMember(member)
    case "constructor":
      return buildConstructorMember(member)
    case "fallback":
      return buildFallbackMember(member)
    default:
      throw "Exhaustiveness miss!"
  }
}

function isConstructorMember(member: Member): member is ConstructorMember {
  return member.type === "constructor"
}

function buildConstructorArguments(abi: Abi): string {
  const constructorMember = abi.find(isConstructorMember)

  if (!constructorMember) {
    return ""
  }

  const args = constructorMember.inputs.map(buildFunctionArgument).join(", ")

  return args === "" ? args : args + ", "
}

function buildFunctionMember(member: FunctionMember) {
  let args = member.inputs.map(buildFunctionArgument).join(", ")

  if (args.length > 0) {
    args += ", "
  }

  const functionSignature = `(${args}options?: TransactionOptions)`
  return `${member.name}: {
    ${functionSignature}: Promise<Web3.TransactionReceipt>;
    call${functionSignature}: ${translateOutputs(member.outputs)};
    sendTransaction${functionSignature}: Promise<string>;
    estimateGas${functionSignature}: Promise<number>;
  }`
}

function translateOutputs(outputs: FunctionMemberInput[]) {
  let valueType
  if (outputs.length === 1) {
    valueType = translateOutput(outputs[0])
  } else if (outputs.length === 0) {
    valueType = "Web3.TransactionReceipt"
  } else {
    valueType = `[${outputs.map(translateOutput).join(", ")}]`
  }

  return `Promise<${valueType}>`
}

function translateOutput(output: FunctionMemberInput) {
  return translateType(output.type, { UInt: "BigNumber.BigNumber" })
}

let unnamedArgumentNumber = 0

function unnamedArgumentName(): string {
  return `unnamed${unnamedArgumentNumber++}`
}

function buildFunctionArgument(input: FunctionMemberInput): string {
  let name = input.name
  if (name[0] == "_") {
    name = name.slice(1)
  }
  const type = translateType(input.type)

  if (name.length === 0) {
    name = unnamedArgumentName()
  }

  return `${name}: ${type}`
}

function translateType(type: SolidityType, options = { UInt: "UInt" }): string {
  switch (type) {
    case "string":
      return "string"
    case "address":
      return "Address"
    case "address[]":
      return "Address[]"
    case "bool":
      return "boolean"
    case "bytes":
      return "string"
    case "bytes32":
      return "string"
    case "uint8":
    case "uint16":
    case "uint64":
    case "uint256":
      return options.UInt
    case "uint256[]":
      return `${options.UInt}[]`
    default:
      throw `Unexpected case! ${type}`
  }
}

function buildEventMember(member: EventMember) {
  let args = member.inputs.map(buildFunctionArgument).join(", ")

  if (args.length > 0) {
    args += ", "
  }

  const eventType = `{${args}}`
  return `${member.name}: Web3.EventFilterCreator<${eventType}>\n`
}

function buildConstructorMember(_member: Member) {
  return ""
}

function buildFallbackMember(_member: Member) {
  return ""
}

const glob = require("glob")

glob("./build/contracts/*.json", {}, (err: string, files: string[]) => {
  let isTruffle = process.argv.indexOf("--truffle") != -1

  let buffer = ""

  if (err) {
    console.log("Error!", err)
    return
  }

  buffer += generateHeader(isTruffle)

  buffer += generateArtifacts(files)

  files.forEach(file => {
    let definition: Definition = require(file)

    buffer += buildContract(definition, isTruffle)
  })

  console.log(buffer)
})
