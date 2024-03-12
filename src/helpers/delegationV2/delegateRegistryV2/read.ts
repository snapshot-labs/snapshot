import { DelegateWithPercent, ExtendedSpace } from '@/helpers/interfaces';
import { DelegationReader } from '@/helpers/delegationV2/delegation';

const DELEGATE_REGISTRY_BACKEND_URL =
  'https://delegate-registry-backend.vercel.app';

type DelegateFromDRV2 = {
  to_address: string;
  delegated_amount?: string | number | bigint;
  number_of_delegations?: number;
};

type DelegateDetailsFromDRV2 = {
  delegators: {
    from_address: string;
    delegated_amount: string;
    to_address_own_amount: string;
  }[];
  voteWeightDelegated: string;
  numberOfDelegators: number;
  delegatesOwnVoteWeight: string;
  totalVoteWeight: string;
};

const emptyDelegate = (address: string): DelegateWithPercent => ({
  id: address,
  delegatedVotes: '0',
  tokenHoldersRepresentedAmount: 0,
  delegatorsPercentage: 0,
  votesPercentage: 0
});

const getDelegations =
  (space: ExtendedSpace): DelegationReader['getDelegates'] =>
  async (first: number, skip: number, orderBy: string) => {
    const response = (await fetch(
      `${DELEGATE_REGISTRY_BACKEND_URL}/api/${space.id}/latest/delegates/top?by=${orderBy}&limit=${first}&offset=${skip}`
    ).then(res => res.json())) as { topDelegates: DelegateFromDRV2[] };

    const formatted: DelegateWithPercent[] = response.topDelegates.map(d => ({
      id: d.to_address,
      delegatedVotes:
        d.delegated_amount?.toString() ??
        d.number_of_delegations?.toString() ??
        '0',
      tokenHoldersRepresentedAmount: 0,
      delegatorsPercentage: 0,
      votesPercentage: 0
    }));

    return formatted;
  };

const getDelegate =
  (space: ExtendedSpace): DelegationReader['getDelegate'] =>
  async (address: string) => {
    const response = (await fetch(
      `${DELEGATE_REGISTRY_BACKEND_URL}/api/${space.id}/latest/delegates/${address}`
    ).then(res => res.json())) as DelegateDetailsFromDRV2;

    if (response.numberOfDelegators > 0) return emptyDelegate(address);

    const formatted: DelegateWithPercent = {
      id: address,
      delegatedVotes: response.voteWeightDelegated.toString(),
      tokenHoldersRepresentedAmount: 0,
      delegatorsPercentage: 0,
      votesPercentage: 0
    };

    return formatted;
  };

const getBalance =
  (space: ExtendedSpace): DelegationReader['getBalance'] =>
  async (address: string) => {
    const response = (await fetch(
      `${DELEGATE_REGISTRY_BACKEND_URL}/api/${space.id}/latest/delegates/${address}`
    ).then(res => res.json())) as DelegateDetailsFromDRV2;

    return response.totalVoteWeight;
  };

type DelegateToFromDRV2 = {
  delegators: {
    from_address: string;
    delegated_amount: string;
    to_address_own_amount: string;
  }[];
  voteWeightDelegated: string;
  numberOfDelegators: number;
  delegatesOwnVoteWeight: string;
  totalVoteWeight: string;
};

const getDelegatingTo =
  (space: ExtendedSpace): DelegationReader['getDelegatingTo'] =>
  async (address: string) => {
    const response = (await fetch(
      `${DELEGATE_REGISTRY_BACKEND_URL}/api/${space.id}/latest/delegates/${address}`
    ).then(res => res.json())) as DelegateToFromDRV2;

    return response.delegators.map(d => d.from_address);
  };

export const getDelegationReader = (
  space: ExtendedSpace
): DelegationReader => ({
  getDelegates: getDelegations(space),
  getDelegate: getDelegate(space),
  getBalance: getBalance(space),
  getDelegatingTo: getDelegatingTo(space)
});
