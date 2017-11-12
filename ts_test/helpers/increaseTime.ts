const web3Call = (method: string, ...params: any[]) => {
  const payload = {
    jsonrpc: "2.0",
    method: method,
    params: params,
    id: +new Date()
  };

  return new Promise((resolve, reject) =>
    web3.currentProvider.sendAsync(payload, function(err) {
      if (err) return reject(err);
      resolve();
    })
  );
};

export const increaseTime = async (seconds: number) =>
  web3Call("evm_increaseTime", seconds);
