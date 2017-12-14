const utils = require("ethereumjs-util");
const abi = require("ethereumjs-abi");

type HexEncodedBinary = string;
type Address = string;

interface ISignInput {
  address: Address;
  privKey: Buffer;
}

function hashAddressForSigning(address: Address): Buffer {
  return abi.soliditySHA3(
    ["address"],
    [new Buffer(address.replace("0x", ""), "hex")]
  );
}

function signAddress({ address, privKey }: ISignInput): HexEncodedBinary {
  const ecsigned = utils.ecsign(hashAddressForSigning(address), privKey);
  const signed = utils.toRpcSig(ecsigned.v, ecsigned.r, ecsigned.s);

  return utils.bufferToHex(signed);
}

export { signAddress };
