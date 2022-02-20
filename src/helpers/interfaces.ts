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
  strategy: {};
  network: string;
  addresses: string[];
  snapshot: number;
}

interface StrategySchema {
  $schema: string;
  $ref: string;
  definitions: {
    Strategy: {};
  };
}

export interface Space {
  id: string;
  name: string;
  about: string;
  symbol: string;
  network: string;
  terms: string;
  skin: string;
  avatar: string;
  twitter: string;
  github: string;
  private: boolean;
  domain: string;
  members: string[];
  admins: string[];
  categories: string[];
  plugins: string[];
  followersCount: number;
  voting: {
    delay: number;
    period: number;
    type: string;
    quorum: number;
    hideAbstain: boolean;
  };
  strategies: {
    name: string;
    params: {};
  };
  validation: {
    name: string;
    params: {
      minScore: number;
      rules: string;
    };
  };
  filters: {
    minScore: number;
    onlyMembers: boolean;
  };
}
