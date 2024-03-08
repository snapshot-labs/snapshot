import {
  BoostRewardGuard,
  BoostVoucherGuard,
  BoostWinnersGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const GUARD_URL = 'https://boost.snapshot.org';

export async function getRewards(
  proposal_id: string,
  voter_address: string,
  boosts: BoostSubgraph[]
): Promise<BoostRewardGuard[]> {
  const results = await fetch(`${GUARD_URL}/get-rewards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      proposal_id,
      voter_address,
      boosts: boosts.map(boost => [boost.id, boost.chainId])
    })
  });

  if (results.status !== 200) throw new Error('Error fetching rewards');
  return results.json();
}

export async function getVouchers(
  proposal_id: string,
  voter_address: string,
  boosts: BoostSubgraph[]
): Promise<BoostVoucherGuard[]> {
  const results = await fetch(`${GUARD_URL}/create-vouchers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      proposal_id,
      voter_address,
      boosts: boosts.map(boost => [boost.id, boost.chainId])
    })
  });

  if (results.status !== 200) throw new Error('Error fetching vouchers');
  return results.json();
}

export async function getWinners(
  proposal_id: string,
  boost_id: string,
  chain_id: string
): Promise<BoostWinnersGuard> {
  const results = await fetch(`${GUARD_URL}/get-lottery-winners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      proposal_id,
      boost_id,
      chain_id
    })
  });

  if (results.status !== 200) {
    const text = await results.text();
    throw new Error(text ? text : 'Error fetching winners');
  }
  return results.json();
}
