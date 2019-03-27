interface BlockInfo {
  number: number
  timestamp: number
}

export async function latestBlockNumber(): Promise<number> {
  return (await latestBlock()).number
}

export async function latestBlockTime(): Promise<number> {
  return (await latestBlock()).timestamp
}

async function latestBlock(): Promise<BlockInfo> {
  const latestBlock = await web3.eth.getBlock('latest')

  if (latestBlock && latestBlock.number && latestBlock.timestamp) {
    return {
      number: latestBlock.number,
      timestamp: latestBlock.timestamp,
    }
  } else {
    throw `Expected web3.eth.getBlock to return a block object but got ${latestBlock}`
  }
}
