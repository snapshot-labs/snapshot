export function waitZilPay(): Promise<any> {
  let k = 0;

  if (window['zilPay']) {
    return Promise.resolve(window['zilPay']);
  }

  return new Promise((resolve, reject) => {
    setInterval(() => {
      if (k > 100) {
        return reject('timeout');
      }

      if (window['zilPay']) {
        resolve(window['zilPay']);
      }

      k++;
    }, 100);
  });
}
