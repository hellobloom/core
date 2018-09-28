export const batchCall = async (func: any, data: string[]) => {
  for (let i = 0, j = data.length, p = Promise.resolve({});i < j; i++) {
    p = p.then(_ => new Promise(resolve => {
        console.log(i);
        func.call(data[i]).then((a: string) => {
          console.log(a)
          resolve()
        });
    }
    ));
  }
}