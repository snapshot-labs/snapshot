import { getAddress } from '@ethersproject/address';
import { subgraphRequest } from '../../utils';

const BALANCER_SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';

export async function strategy(provider, addresses, options, snapshot) {
  const params = {
    poolShares: {
      __args: {
        where: {
          userAddress_in: addresses.map(address => address.toLowerCase()),
          balance_gt: 0
        },
        first: 1000,
        orderBy: 'balance',
        orderDirection: 'desc'
      },
      userAddress: {
        id: true
      },
      balance: true,
      poolId: {
        totalShares: true,
        tokens: {
          id: true,
          balance: true
        }
      }
    }
  };
  if (snapshot !== 'latest') {
    // @ts-ignore
    params.poolShares.__args.block = { number: snapshot };
  }
  const result = await subgraphRequest(BALANCER_SUBGRAPH_URL, params);
  const score = {};
  if (result && result.poolShares) {
    result.poolShares.forEach(poolShare =>
      poolShare.poolId.tokens.map(poolToken => {
        const [, tokenAddress] = poolToken.id.split('-');
        if (tokenAddress === options.address.toLowerCase()) {
          const userAddress = getAddress(poolShare.userAddress.id);
          if (!score[userAddress]) score[userAddress] = 0;
          score[userAddress] =
            score[userAddress] +
            (poolToken.balance / poolShare.poolId.totalShares) *
              poolShare.balance;
        }
      })
    );
  }
  return score || {};
}
