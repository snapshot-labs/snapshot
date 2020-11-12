export function waitZilPay(): Promise<any> {
  let k = 0;

  if (window['zilPay']) {
    return Promise.resolve(window['zilPay']);
  }

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (k > 100) {
        clearInterval(interval);

        return reject('timeout');
      }

      if (window['zilPay']) {
        clearInterval(interval);
        return resolve(window['zilPay']);
      }

      k++;
    }, 100);
  });
}
