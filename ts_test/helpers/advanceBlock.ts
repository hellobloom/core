import web3Call from "./web3Call";

export const advanceBlock = async () => web3Call("evm_mine");

export const advanceBlocks = async (numBlocks: number) => {
  for (let i = 0; i < numBlocks; i++) {
    await advanceBlock();
  }
};
