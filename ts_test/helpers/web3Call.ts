export default (method: string, ...params: any[]) => {
  const payload = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: +new Date(),
  }

  return new Promise((resolve, reject) =>
    web3.currentProvider.send(payload, function(err: Error) {
      if (err) return reject(err)
      resolve()
    })
  )
}
