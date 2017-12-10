import web3Call from "./web3Call";

export const increaseTime = async (seconds: number) =>
  web3Call("evm_increaseTime", seconds);
