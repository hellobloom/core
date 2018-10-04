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
  let str = ``

  str += `
interface IContractMethodArgument {
  type: string,
  index: number
}

interface IContractMethodManifest {
  methods: {
    [key: string]: {
      args_arr: string[],
      args: {
        [key:string]: IContractMethodArgument
      }
    }
  }
}
  `

  return str
}

function buildContract(definition: Definition, isTruffle: boolean) {
  return `
export const ${definition.contractName}: IContractMethodManifest = {
  "methods": {
    ${buildMembers(definition.abi, isTruffle)}
  },
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
    default:
      return ""
  }
}

function buildFunctionMember(member: FunctionMember) {
  //console.log("MEMBER", member)
  const inputsWithNames = member.inputs.map((x: any, i: number) => {
    if (!x.name) {
      x.name = "anonymous_" + i.toString()
    }
    return x
  })
  var str = ""
  str += `  "${member.name}": {\n`
  str += `      "args_arr": [${inputsWithNames.map((input: any) => '"' + input.name + '"').join(",")}],\n`
  str += `      "args": {\n`
  inputsWithNames.forEach((input: any, index: number) => {
    str += `        "${input.name}": {\n`
    str += `          "type": "${input.type}",\n`
    str += `          "index": ${index},\n`
    str += `        }`
    if (index != inputsWithNames.length) {
      str += ","
    }
    str += `\n`
  })
  str += `      },\n`
  str += `  },`
  return str
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
  console.log("MEMBER", member)
  let args = member.inputs.map(buildFunctionArgument).join(", ")

  if (args.length > 0) {
    args += ", "
  }

  const eventType = `{${args}}`
  return `${member.name}: Web3.EventFilterCreator<${eventType}>\n`
}

function buildFallbackMember(_member: Member) {
  return ""
}

const glob = require("glob")

glob("./build/contracts/*.json", {}, (err: string, files: string[]) => {
  let isTruffle = process.argv.indexOf("--truffle") != -1

  let buffer = ""

  let method_buffer = ""

  if (err) {
    console.log("Error!", err)
    return
  }

  buffer += generateHeader(isTruffle)

  let contract_names = []

  files.forEach(file => {
    let definition: Definition = require(file)

    contract_names.push(definition.contractName)

    method_buffer += buildContract(definition, isTruffle)
  })

  buffer += `export type TContractNames = keyof typeof EContractNames\n\n`

  buffer += `export enum EContractNames {` + contract_names.map((x: string) => `'${x}' = '${x}'`).join(`,`) + `}\n\n`

  buffer += method_buffer

  console.log(buffer)
})
