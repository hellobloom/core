interface BlockInfo {
  number: number;
  timestamp: number;
}

export function latestBlockNumber(): number {
  return latestBlock().number;
}

export function latestBlockTime(): number {
  return latestBlock().timestamp;
}

function latestBlock(): BlockInfo {
  const latestBlock = web3.eth.getBlock("latest");

  if (latestBlock && latestBlock.number && latestBlock.timestamp) {
    return {
      number: latestBlock.number,
      timestamp: latestBlock.timestamp
    };
  } else {
    throw `Expected web3.eth.getBlock to return a block object but got ${latestBlock}`;
  }
}
