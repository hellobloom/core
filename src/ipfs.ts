import { BigNumber } from "bignumber.js";
const multihash = require("multihashes");
const { bufferToHex, stripHexPrefix } = require("ethereumjs-util");

function fromStruct([hashFn, size, hash]: [BigNumber, BigNumber, string]) {
  const asBuffer = Buffer.concat([
    Buffer.from([hashFn.toNumber()]),
    Buffer.from([size.toNumber()]),
    new Buffer(stripHexPrefix(hash), "hex")
  ]);

  return multihash.toB58String(asBuffer);
}

function toHex(base58String: string) {
  return bufferToHex(multihash.fromB58String(base58String));
}

export { fromStruct, toHex };
