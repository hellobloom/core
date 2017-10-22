interface ConstructorMember {
  inputs: FunctionMemberInput[];
  payable: false;
  type: "constructor";
}

interface EventMember {
  inputs: FunctionMemberInput[];
  name: string;
  type: "event";
}

interface FunctionMember {
  inputs: FunctionMemberInput[];
  outputs: FunctionMemberInput[];
  name: string;
  constant: boolean;
  payable: boolean;
  type: "function";
}

interface FallbackMember {
  type: "fallback";
  payable: boolean;
}

interface UnknownMember {
  type: string;
}

type SolidityType =
  | "address"
  | "address[]"
  | "bool"
  | "bytes"
  | "string"
  | "uint8"
  | "uint64"
  | "uint256"
  | "uint256[]";

interface FunctionMemberInput {
  name: string;
  type: SolidityType;
}

type Member = ConstructorMember | EventMember | FunctionMember | FallbackMember;

type Abi = (EventMember | FunctionMember)[];

interface Definition {
  contract_name: string;
  abi: Abi;
}

function generateHeader(): string {
  return `
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
  `;
}

function buildContract(definition: Definition) {
  return `
    export interface ${definition.contract_name}Instance extends ContractInstance {
      ${buildMembers(definition.abi)}
    }
  `;
}

function buildMembers(abi: Abi): string {
  return abi.map(buildMember).join("\n");
}

function buildMember(member: Member): string {
  switch (member.type) {
    case "function":
      return buildFunctionMember(member);
    case "event":
      return buildEventMember(member);
    case "constructor":
      return buildConstructorMember(member);
    case "fallback":
      return buildFallbackMember(member);
    default:
      throw "Exhaustiveness miss!";
  }
}

function buildFunctionMember(member: FunctionMember) {
  let args = member.inputs.map(buildFunctionArgument).join(", ");

  if (args.length > 0) {
    args += ", ";
  }

  return `${member.name}(${args}options?: TransactionOptions): ${translateOutputs(
    member.outputs
  )};`;
}

function translateOutputs(outputs: FunctionMemberInput[]) {
  let valueType;
  if (outputs.length === 1) {
    valueType = translateOutput(outputs[0]);
  } else if (outputs.length === 0) {
    valueType = "void";
  } else {
    valueType = `[${outputs.map(translateOutput).join(", ")}]`;
  }

  return `Promise<${valueType}>`;
}

function translateOutput(output: FunctionMemberInput) {
  return translateType(output.type, { UInt: "BigNumber.BigNumber" });
}

let unnamedArgumentNumber = 0;

function unnamedArgumentName(): string {
  return `unnamed${unnamedArgumentNumber++}`;
}

function buildFunctionArgument(input: FunctionMemberInput): string {
  let name = input.name;
  if (name[0] == "_") {
    name = name.slice(1);
  }
  const type = translateType(input.type);

  if (name.length === 0) {
    name = unnamedArgumentName();
  }

  return `${name}: ${type}`;
}

function translateType(type: SolidityType, options = { UInt: "UInt" }): string {
  switch (type) {
    case "string":
      return "string";
    case "address":
      return "Address";
    case "address[]":
      return "Address[]";
    case "bool":
      return "boolean";
    case "bytes":
      return "string";
    case "uint8":
    case "uint64":
    case "uint256":
      return options.UInt;
    case "uint256[]":
      return `${options.UInt}[]`;
    default:
      throw `Unexpected case! ${type}`;
  }
}

function buildEventMember(_member: Member) {
  return "";
}

function buildConstructorMember(_member: Member) {
  return "";
}

function buildFallbackMember(_member: Member) {
  return "";
}

const glob = require("glob");

glob("./build/contracts/*.json", {}, (err: string, files: string[]) => {
  if (err) {
    console.log("Error!", err);
    return;
  }

  console.log(generateHeader());

  files.forEach(file => {
    let definition: Definition = require(file);

    console.log(buildContract(definition));
  });
});
