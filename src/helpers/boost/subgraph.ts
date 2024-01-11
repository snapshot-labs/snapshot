import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

const SUBGRAPH_URLS = {
  '11155111':
    'https://api.thegraph.com/subgraphs/name/snapshot-labs/boost-sepolia'
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
      amount: true
    }
  });
}

export function getBoosts(proposalId: string, chainId: string) {
  return subgraphRequest(SUBGRAPH_URLS[chainId], {
    proposal: {
      __args: {
        id: proposalId
      },

      boosts: {
        id: true,
        strategyURI: true,
        poolSize: true,
        guard: true,
        start: true,
        end: true,
        owner: true,
        chainId: true,
        token: {
          id: true,
          name: true,
          symbol: true,
          decimals: true
        },
        strategy: {
          name: true,
          params: {
            version: true,
            proposal: true,
            eligibility: {
              choice: true
            },
            distribution: {
              type: true
            }
          }
        }
      }
    }
  });
}
