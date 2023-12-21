type Boosts = string[][];

export type Reward = {
  boost_id: string;
  chain_id: string;
  reward: string;
};

export type Voucher = {
  boost_id: string;
  chain_id: string;
  signature: string;
  reward: string;
};

export async function getRewards(
  proposal_id: string,
  voter_address: string,
  boosts: Boosts
): Promise<Reward[]> {
  const results = await fetch(
    'https://boost-guard-djc2x.ondigitalocean.app/get-rewards',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proposal_id,
        voter_address,
        boosts
      })
    }
  );

  return results.json();
}

export async function getVouchers(
  proposal_id: string,
  voter_address: string,
  boosts: Boosts
): Promise<Voucher[]> {
  const results = await fetch(
    'https://boost-guard-djc2x.ondigitalocean.app/create-vouchers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proposal_id,
        voter_address,
        boosts
      })
    }
  );

  return results.json();
}
