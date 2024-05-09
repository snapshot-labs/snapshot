import { DelegateWithPercent, ExtendedSpace } from '@/helpers/interfaces';
import { DelegationReader } from '@/helpers/delegationV2/delegation';

const SPLIT_DELEGATE_BACKEND_URL = 'https://delegate-api.gnosisguild.org';

type DelegateFromSD = {
  address: string;
  delegatorCount: number;
  percentOfDelegators: number;
  votingPower: number;
  percentOfVotingPower: number;
};

// const emptyDelegate = (address: string): DelegateWithPercent => ({
//   id: address,
//   delegatedVotes: '0',
//   tokenHoldersRepresentedAmount: 0,
//   delegatorsPercentage: 0,
//   votesPercentage: 0
// });

const bpsToPercent = (bps: number): number => bps / 10000;

const getDelegations =
  (space: ExtendedSpace): DelegationReader['getDelegates'] =>
  async (first: number, skip: number, matchFilter: string) => {
    let orderBy = 'power';
    if (matchFilter === 'tokenHoldersRepresentedAmount') {
      orderBy = 'count';
    }

    const splitDelStrategy = space.strategies.find(
      strat => strat.name === 'split-delegation'
    );

    if (!splitDelStrategy) {
      throw new Error('Split delegation strategy not found');
    }

    const response = (await fetch(
      `${SPLIT_DELEGATE_BACKEND_URL}/api/v1/${space.id}/pin/top-delegates?by=${orderBy}&limit=${first}&offset=${skip}`,
      {
        method: 'POST',
        body: JSON.stringify({
          totalSupply: splitDelStrategy.params.totalSupply,
          strategies: splitDelStrategy.params.strategies,
          network: space.network
        })
      }
    ).then(res => res.json())) as { delegates: DelegateFromSD[] };

    const formatted: DelegateWithPercent[] = response.delegates.map(d => ({
      id: d.address,
      delegatedVotes: d.votingPower.toString(),
      tokenHoldersRepresentedAmount: d.delegatorCount,
      delegatorsPercentage: bpsToPercent(d.percentOfDelegators),
      votesPercentage: bpsToPercent(d.percentOfVotingPower)
    }));

    return formatted;
  };

const getDelegate =
  (space: ExtendedSpace): DelegationReader['getDelegate'] =>
  async (address: string) => {
    const splitDelStrategy = space.strategies.find(
      strat => strat.name === 'split-delegation'
    );

    if (!splitDelStrategy) {
      throw new Error('Split delegation strategy not found');
    }
    const response = (await fetch(
      `${SPLIT_DELEGATE_BACKEND_URL}/api/v1/${space.id}/pin/delegate/${address}`,
      {
        method: 'POST',
        body: JSON.stringify({
          totalSupply: splitDelStrategy.params.totalSupply,
          strategies: splitDelStrategy.params.strategies,
          network: space.network
        })
      }
    ).then(res => res.json())) as DelegateFromSD;

    const formatted: DelegateWithPercent = {
      id: address,
      delegatedVotes: response.votingPower.toString(),
      tokenHoldersRepresentedAmount: response.delegatorCount,
      delegatorsPercentage: bpsToPercent(response.percentOfDelegators),
      votesPercentage: bpsToPercent(response.percentOfVotingPower)
    };

    return formatted;
  };

const getBalance =
  (space: ExtendedSpace): DelegationReader['getBalance'] =>
  async (address: string) => {
    const splitDelStrategy = space.strategies.find(
      strat => strat.name === 'split-delegation'
    );

    if (!splitDelStrategy) {
      throw new Error('Split delegation strategy not found');
    }
    const response = (await fetch(
      `${SPLIT_DELEGATE_BACKEND_URL}/api/v1/${space.id}/pin/delegate/${address}`,
      {
        method: 'POST',
        body: JSON.stringify({
          totalSupply: splitDelStrategy.params.totalSupply,
          strategies: splitDelStrategy.params.strategies,
          network: space.network
        })
      }
    ).then(res => res.json())) as DelegateFromSD;

    return response.votingPower.toString();
  };

type DelegatorResponse = {
  delegates: DelegateFromSD[];
  delegator: string;
  blockNumber: number;
};

const getDelegatingTo =
  (space: ExtendedSpace): DelegationReader['getDelegatingTo'] =>
  async (address: string) => {
    const splitDelStrategy = space.strategies.find(
      strat => strat.name === 'split-delegation'
    );

    if (!splitDelStrategy) {
      throw new Error('Split delegation strategy not found');
    }
    const response = (await fetch(
      `${SPLIT_DELEGATE_BACKEND_URL}/api/v1/${space.id}/pin/delegator/${address}`,
      {
        method: 'POST',
        body: JSON.stringify({
          totalSupply: splitDelStrategy.params.totalSupply,
          strategies: splitDelStrategy.params.strategies,
          network: space.network
        })
      }
    ).then(res => res.json())) as DelegatorResponse;

    return response.delegates.map(d => d.address);
  };

export const getDelegationReader = (
  space: ExtendedSpace
): DelegationReader => ({
  getDelegates: getDelegations(space),
  getDelegate: getDelegate(space),
  getBalance: getBalance(space),
  getDelegatingTo: getDelegatingTo(space)
});
