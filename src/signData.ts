const utils = require("ethereumjs-util");
const abi = require("ethereumjs-abi");
const { soliditySha3 } = require("web3-utils");
import { bufferToHex } from "ethereumjs-util";
const uuid = require('uuidv4')

type HexEncodedBinary = string;

interface ISignDataInput {
  data: object;
  privKey: Buffer;
}

function hashStringForSigning(string: string): Buffer {
  return abi.soliditySHA3(["string"], [new Buffer(string, "utf8")]);
}

const serializeData = (data: object) => JSON.stringify(data);

const hashData = (data: object) => hashStringForSigning(serializeData(data));

const generateSigNonce = () =>
  bufferToHex(soliditySha3({type: 'string', value: uuid()}))

export { hashData, generateSigNonce };
