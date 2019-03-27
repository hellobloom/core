interface IParsedData {
  requesters: string[]
  attesters: string[]
  subjects: string[]
  dataHashes: string[]
}

export const batchMigrateAttestations = async (
  func: any,
  data: IParsedData,
  options: {
    startingNonce: number
    gasPrice: number
    gas: number
    from: string
    chunkSize: number
  }
) => {
  let nonce = options.startingNonce
  for (
    let i = 0, j = data.requesters.length, p = Promise.resolve({});
    i < j;
    i += options.chunkSize
  ) {
    p = p.then(
      _ =>
        new Promise(resolve => {
          console.log(nonce.toString())
          let dataChunk: any = [
            data.requesters.slice(i, i + options.chunkSize),
            data.attesters.slice(i, i + options.chunkSize),
            data.subjects.slice(i, i + options.chunkSize),
            data.dataHashes.slice(i, i + options.chunkSize),
          ]
          dataChunk.push({
            nonce: nonce,
            gasPrice: options.gasPrice,
            gas: options.gas,
            from: options.from,
          })
          func.sendTransaction.apply(null, dataChunk).then((txHash: string) => {
            console.log(txHash)
            nonce++
            resolve()
          })
        })
    )
  }
}
