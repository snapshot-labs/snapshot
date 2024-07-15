import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { SUPPORTED_NETWORKS } from '@/helpers/boost';
import { BoostSubgraph } from '@/helpers/boost/types';

const SUBGRAPH_URLS = {
  '1': 'https://subgrapher.snapshot.org/subgraph/arbitrum/A6EEuSAB7mFrWvLBnL1HZXwfiGfqFYnFJjc14REtMNkd',
  '11155111':
    'https://subgrapher.snapshot.org/subgraph/arbitrum/6T64qrPe7S46zhArSoBF8CAmc5cG3PyKa92Nt4Jhymcy',
  '137':
    'https://subgrapher.snapshot.org/subgraph/arbitrum/CkNpf5gY7XPCinJWP1nh8K7u6faXwDjchGGV4P9rgJ7',
  '8453':
    'https://subgrapher.snapshot.org/subgraph/arbitrum/52uVpyUHkkMFieRk1khbdshUw26CNHWAEuqLojZzcyjd'
};

export async function getClaims(recipient: string) {
  async function query(chainId: string) {
    const data = await subgraphRequest(SUBGRAPH_URLS[chainId], {
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

    if (data?.claims) {
      data.claims = data.claims.map(claim => ({
        ...claim,
        chainId
      }));
    }
    return data;
  }

  const requests = SUPPORTED_NETWORKS.map(chainId => query(chainId));
  const responses = await Promise.all(requests);

  return responses.map(response => response.claims).flat();
}

export async function getBoosts(proposalIds: string[]) {
  async function query(chainId: string) {
    const data = await subgraphRequest(SUBGRAPH_URLS[chainId], {
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
    if (data?.boosts) {
      data.boosts = data.boosts.map(boost => ({
        ...boost,
        chainId
      }));
    }
    return data;
  }
  const requests = SUPPORTED_NETWORKS.map(chainId => query(chainId));
  const responses: { boosts: BoostSubgraph }[] = await Promise.all(requests);

  return responses
    .map(response => response.boosts)
    .filter(boost => boost)
    .flat();
}
