export const _strategies = {
  'zrc2-balance-of': {
    author: 'zilpay',
    key: 'zrc2-balance-of',
    version: '0.0.1',
    strategy: async function(
      provider: any,
      addresses: string[],
      options: any,
      snapshot
    ) {
      if (Array.isArray(addresses) && addresses.length === 0) {
        return [];
      }

      const balances = await Promise.all(
        addresses.map(async address => {
          address = String(address).toLowerCase();

          const {
            result
          } = await provider.blockchain.getSmartContractSubState(
            options.address,
            'balances',
            [address]
          );

          if (result && result.balances && result.balances[address]) {
            const amount = result.balances[address];
            return [
              address,
              Number(amount) / Math.pow(10, Number(options.decimals))
            ];
          }

          return [address, '0'];
        })
      );

      return Object.fromEntries(balances);
    }
  }
};

export async function getScores(
  strategies: any[],
  provider: any,
  addresses: string[],
  snapshot = 'latest'
) {
  return await Promise.all(
    strategies.map(strategy => {
      return _strategies[strategy.name].strategy(
        provider,
        addresses,
        strategy.params,
        snapshot
      );
    })
  );
}
