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

export interface Profile {
  id: string;
  name: string;
  ens: string;
  about?: string;
  avatar?: string;
  created?: number;
}

export interface ProfileActivity {
  id: string;
  created: number;
  type: string;
  title: string;
  space: { id: string; avatar: string };
  vote?: { proposalId: string; choice: string; type: string };
}

export interface TreasuryAsset {
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  contract_decimals: number;
  logo_url: string;
  balance: string;
  balance_24h: string;
  quote: number;
  quote_24h: number;
}

export interface TreasuryWallet {
  name: string;
  address: string;
  network: string;
}

export interface ExtendedSpace {
  id: string;
  name: string;
  symbol: string;
  network: string;
  strategies: SpaceStrategy[];
  about: string;
  avatar: string;
  skin: string;
  domain: string | null;
  website: string | null;
  terms: string | null;
  coingecko: string | null;
  github: string | null;
  twitter: string | null;
  followersCount: number;
  private: boolean;
  admins: string[];
  members: string[];
  categories: string[];
  parent: ExtendedSpace | null;
  children: ExtendedSpace[];
  filters: { minScore: number; onlyMembers: boolean };
  plugins: Record<string, any>;
  validation: SpaceValidation;
  treasuries: TreasuryAsset[];
  voting: {
    delay: number | null;
    hideAbstain: boolean;
    period: number | null;
    quorum: number | null;
    type: string | null;
    privacy: string | null;
  };
}

export interface SpaceValidation {
  name: string;
  params: Record<string, any>;
}

export interface SpaceStrategy {
  name: string;
  network: string;
  params: Record<string, unknown>;
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
  privacy: string;
  discussion: string;
  quorum: number;
  scores: number[];
  scores_state: string;
  scores_total: number;
  scores_by_strategy: number[][];
  votes: number;
  plugins: Record<string, any>;
  space: ExtendedSpace;
  strategies: SpaceStrategy[];
}

export interface Results {
  scoresByStrategy: number[][];
  scores: number[];
  scoresTotal: number;
}

export type Choice = number | number[] | Record<string, any>;

export interface Vote {
  ipfs: string;
  voter: string;
  choice: Choice;
  balance: number;
  scores: number[];
  vp: number;
  vp_by_strategy: number[];
  reason: string;
  created: number;
}

export interface Plugin {
  author: string;
  defaults: any;
  name: string;
  version: string;
  icon?: string;
  description?: string;
  website?: string;
}

export interface PluginIndex extends Plugin {
  key: string;
}

export interface FormError {
  message: string;
  push?: boolean;
}
