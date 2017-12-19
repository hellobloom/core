const multihash = require("multihashes");
const { bufferToHex, stripHexPrefix } = require("ethereumjs-util");

function fromHex(hexString: string): string {
  return multihash.toB58String(
    multihash.fromHexString(stripHexPrefix(hexString))
  );
}

function toHex(base58String: string) {
  return bufferToHex(multihash.fromB58String(base58String));
}

export { fromHex, toHex };
