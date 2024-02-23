export type BoostClaimSubgraph = {
  id: string;
  amount: string;
  transactionHash: string;
  chainId: string;
  boost: {
    id: string;
  };
};

export type BoostRewardGuard = {
  boost_id: string;
  chain_id: string;
  reward: string;
};

export type BoostVoucherGuard = {
  boost_id: string;
  chain_id: string;
  signature: string;
  reward: string;
};

export type BoostWinnersGuard = {
  winners: string[];
  prize: string;
};

export interface BoostStrategy {
  name: string;
  description: string;
  image: string;
  external_url: string;
  params: {
    version: string;
    env: string;

    proposal: string;
    eligibility: {
      type: 'incentive' | 'bribe';
      choice?: string;
    };
    distribution: {
      type: 'weighted' | 'lottery';
      limit?: string;
      numWinners?: string;
    };
  };
}

export type BoostSubgraph = {
  id: string;
  strategyURI: string;
  poolSize: string;
  guard: string;
  start: string;
  end: string;
  owner: string;
  chainId: string;
  currentBalance: string;
  transaction: string;
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: string;
  };
  strategy: {
    id: string;
    version: string;
    name: string;
    proposal: string;
    eligibility: {
      type: 'incentive' | 'bribe';
      choice: string | null;
    };
    distribution: {
      type: 'weighted' | 'lottery';
      limit: string | null;
      numWinners: string | null;
    };
  };
};
