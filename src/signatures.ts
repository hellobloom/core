const { ecsign, toRpcSig, toBuffer } = require("ethereumjs-util");
const { soliditySha3 } = require("web3-utils");

const soliditySign = ({ data, privKey }: { data: any[]; privKey: Buffer }) => {
  const digest: Buffer = toBuffer(soliditySha3(...data));
  const ecsigned = ecsign(digest, privKey);
  return toRpcSig(ecsigned.v, ecsigned.r, ecsigned.s);
};

export { soliditySign };
