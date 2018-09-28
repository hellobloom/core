export const batchSend = async (func: any, data: any[][], options: {
  startingNonce: number,
  gasPrice: number,
  gas: number,
  from: string
}) => {
  let nonce = options.startingNonce
  for (let i = 0, j = data.length, p = Promise.resolve({});i < j; i++) {
    p = p.then(_ => new Promise(resolve => {
        console.log(nonce.toString());
        data[i].push({
            nonce: nonce,
            gasPrice: options.gasPrice,
            gas: options.gas,
            from: options.from
        })
        func.sendTransaction.apply(
          null,
          data[i]).then((txHash: string) => {
          console.log(txHash)
          nonce++
          resolve()
        });
    }
    ));
  }
}