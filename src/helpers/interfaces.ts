export interface Strategy {
  id: string;
  spacesCount: number;
  author: string;
  version: string;
  about?: string;
  schema?: StrategySchema | null;
  examples?: StrategyExample[];
}

interface StrategyExample {
  name: string;
  strategy: Record<string, any>;
  network: string;
  addresses: string[];
  snapshot: number;
}

interface StrategySchema {
  $schema: string;
  $ref: string;
  definitions: {
    Strategy: Record<string, unknown>;
  };
}

export interface StrategyDefinitionProperties {
  type: string;
  title: string;
  default?: any;
  examples?: string[];
  description?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}
export interface StrategyDefinition {
  title: string;
  type: string;
  default?: any;
  description?: string;
  required?: string[];
  additionalProperties?: boolean;
  properties?: StrategyDefinitionProperties;
}

export interface ProfileActivity {
  id: string;
  created: number;
  type: string;
  title: string;
  space: { id: string; avatar: string };
  vote?: { proposalId: string; choice: string; type: string };
}

export interface ExtendedSpace {
  id: string;
  name: string;
  symbol: string;
  network: string;
  strategies: {
    name: string;
    network: string;
    params: Record<string, unknown>;
  }[];
  about: string;
  avatar: string;
  skin: string;
  domain: string | null;
  website: string | null;
  terms: string | null;
  github: string | null;
  twitter: string | null;
  followerCount: number;
  private: boolean;
  admins: string[];
  members: string[];
  categories: string[];
  filters: { minScore: number; onlyMembers: boolean };
  plugins: Record<string, any>;
  validation: { name: string; params: Record<string, any> };
  voting: {
    delay: number | null;
    hideAbstain: boolean;
    period: number | null;
    quorum: number | null;
    type: string | null;
  };
}

export interface Proposal {
  id: string;
  title: string;
  ipfs: string;
  network: string;
  choices: string[];
  type: string;
  snapshot: string;
  author: string;
  body: string;
  created: number;
  start: number;
  end: number;
  state: string;
  symbol: string;
  discussion: string;
  quorum: number;
  scores: number[];
  scores_state: string;
  scores_total: number;
  scores_by_strategy: number[][];
  votes: number;
  plugins: Record<string, any>;
  space: { id: string; name: string };
  strategies: { name: string; network: string; params: Record<string, any> }[];
}

export interface Results {
  resultsByStrategyScore: number[][];
  resultsByVoteBalance: number[];
  sumOfResultsBalance: number;
}

export interface Vote {
  ipfs: string;
  voter: string;
  choice: number | number[] | Record<string, any>;
  balance: number;
  scores: number[];
  vp: number;
  vp_by_strategy: number[];
}
