import { DelegateWithPercent, ExtendedSpace } from '@/helpers/interfaces';
import {
  DelegateTreeItem,
  DelegationReader,
  DelegatorTreeItem
} from '@/helpers/delegationV2/types';

const SPLIT_DELEGATE_BACKEND_URL = 'https://delegate-api.gnosisguild.org';

type DelegateFromSD = {
  address: string;
  delegatorCount: number;
  percentOfDelegators: number;
  votingPower: number;
  percentOfVotingPower: number;
};

type AddressResponse = {
  chainId: number;
  blockNumber: number;
  address: string;
  votingPower: Record<string, number>;
  percentOfVotingPower: number;
  percentOfDelegators: number;
  delegates: string[];
  delegateTree: DelegateTreeItem[];
  delegators: string[];
  delegatorTree: DelegatorTreeItem[];
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

    const response = (await fetch(
      `${
        space.delegationPortal.delegationApi || SPLIT_DELEGATE_BACKEND_URL
      }/api/v1/${
        space.id
      }/pin/top-delegates?by=${orderBy}&limit=${first}&offset=${skip}`,
      {
        method: 'POST',
        body: JSON.stringify({
          strategy: splitDelStrategy
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

    const response = (await fetch(
      `${
        space.delegationPortal.delegationApi || SPLIT_DELEGATE_BACKEND_URL
      }/api/v1/${space.id}/pin/${address}`,
      {
        method: 'POST',
        body: JSON.stringify({
          strategy: splitDelStrategy
        })
      }
    ).then(res => res.json())) as AddressResponse;

    const formatted: DelegateWithPercent = {
      id: address,
      delegatedVotes: response.votingPower.toString(),
      tokenHoldersRepresentedAmount: response.delegators.length,
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

    const response = (await fetch(
      `${
        space.delegationPortal.delegationApi || SPLIT_DELEGATE_BACKEND_URL
      }/api/v1/${space.id}/pin/${address}`,
      {
        method: 'POST',
        body: JSON.stringify({
          strategy: splitDelStrategy
        })
      }
    ).then(res => res.json())) as DelegateFromSD;

    return response.votingPower.toString();
  };

const getDelegatingTo =
  (space: ExtendedSpace): DelegationReader['getDelegatingTo'] =>
  async (address: string) => {
    const splitDelStrategy = space.strategies.find(
      strat => strat.name === 'split-delegation'
    );

    const response = (await fetch(
      `${
        space.delegationPortal.delegationApi || SPLIT_DELEGATE_BACKEND_URL
      }/api/v1/${space.id}/pin/${address}`,
      {
        method: 'POST',
        body: JSON.stringify({
          strategy: splitDelStrategy
        })
      }
    ).then(res => res.json())) as AddressResponse;

    return {
      delegates: response.delegates,
      delegateTree: response.delegateTree
    };
  };

export const getDelegationReader = (
  space: ExtendedSpace
): DelegationReader => ({
  getDelegates: getDelegations(space),
  getDelegate: getDelegate(space),
  getBalance: getBalance(space),
  getDelegatingTo: getDelegatingTo(space)
});
