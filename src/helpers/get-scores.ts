const _strategies = {
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
      const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
      const address = String(
        provider.wallet.defaultAccount.base16
      ).toLowerCase();
      let balance = '0';

      if (Array.isArray(addresses) && addresses.length === 0) {
        return [];
      }

      try {
        const {
          result
        } = await provider.blockchain.getSmartContractSubState(
          String(options.address).toLowerCase(),
          'balances',
          [address]
        );

        if (result && result.balances && result.balances[address]) {
          balance = result.balances[address];
        }
      } catch (err) {
        console.error(err);
      }

      if (!addresses[0]) {
        throw new Error('address is null');
      }

      return {
        [addresses[0]]: (
          Number(balance) / Math.pow(10, Number(options.decimals))
        ).toFixed(4)
      };
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
