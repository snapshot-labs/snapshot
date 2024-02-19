import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { SUPPORTED_NETWORKS } from '@/helpers/boost';
import { BoostSubgraph } from '@/helpers/boost/types';

const SUBGRAPH_URLS = {
  '1': 'https://api.studio.thegraph.com/query/23545/boost/version/latest',
  '11155111':
    'https://api.studio.thegraph.com/query/23545/boost-sepolia/version/latest'
};

export function getClaims(recipient: string, chainId: string) {
  return subgraphRequest(SUBGRAPH_URLS[chainId], {
    claims: {
      __args: {
        where: {
          recipient
        }
      },
      id: true,
      amount: true,
      transactionHash: true,
      boost: {
        id: true
      }
    }
  });
}

export async function getBoosts(proposalIds: string[]) {
  async function query(chainId: string) {
    return subgraphRequest(SUBGRAPH_URLS[chainId], {
      boosts: {
        __args: {
          where: { strategy_: { proposal_in: proposalIds } }
        },
        id: true,
        strategyURI: true,
        poolSize: true,
        guard: true,
        start: true,
        end: true,
        owner: true,
        chainId: true,
        currentBalance: true,
        transaction: true,
        token: {
          id: true,
          name: true,
          symbol: true,
          decimals: true
        },
        strategy: {
          id: true,
          name: true,
          version: true,
          proposal: true,
          eligibility: {
            type: true,
            choice: true
          },
          distribution: {
            type: true,
            limit: true,
            numWinners: true
          }
        }
      }
    });
  }
  const requests = SUPPORTED_NETWORKS.map(chainId => query(chainId));
  const responses: { boosts: BoostSubgraph }[] = await Promise.all(requests);

  return responses
    .map(response => response.boosts)
    .filter(boost => boost)
    .flat();
}
