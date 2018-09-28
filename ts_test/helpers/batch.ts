export const batch = async (func: any, data: any[], options: {
  chunkSize: number,
  startingNonce: number,
  gasPrice: number
}) => {
  let nonce = options.startingNonce
  for (let i = 0, j = data.length, p = Promise.resolve({});i < j; i+=options.chunkSize) {
    p = p.then(_ => new Promise(resolve => {
        console.log(i);
        func.sendTransaction(data.slice(i, i + options.chunkSize), {
          nonce: nonce,
          gasPrice: options.gasPrice,
        }).then(() => {
          nonce++
          resolve()
        });
    }
    ));
  }
}