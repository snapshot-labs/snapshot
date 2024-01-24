export type BoostClaimSubgraph = {
  id: string;
  amount: string;
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

export interface BoostStrategy {
  name: string;
  params: {
    proposal: string;
    eligibility: {
      choice?: string;
    };
    distribution: {
      type: 'even' | 'weighted';
      limit?: string;
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
      choice: number | null;
    };
    distribution: {
      type: 'even' | 'weighted';
      limit: number | null;
    };
  };
};
