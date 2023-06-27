import { BigNumber } from '@ethersproject/bignumber';
import { Fragment, JsonFragment } from '@ethersproject/abi';

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
  vote?: {
    proposalId: string;
    choice: string;
    type: string;
  };
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

export interface ExploreSpace {
  id: string;
  name: string;
  private?: boolean;
  terms?: string;
  network?: string;
  networks?: string[];
  categories?: string[];
  proposals?: number;
  proposals_active?: number;
  proposals_7d?: number;
  votes?: number;
  votes_7d?: number;
  followers?: number;
  followers_7d?: number;
}

export interface Space {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  activeProposals: number;
  followersCount: number;
  flagged: boolean;
  terms: string;
}

export interface RankedSpace {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rank: number;
  categories: string[];
  activeProposals: number;
  proposalsCount: number;
  proposalsCount7d: number;
  followersCount: number;
  followersCount7d: number;
  votesCount: number;
  votesCount7d: number;
  terms: string;
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
  moderators: string[];
  members: string[];
  categories: string[];
  parent: ExtendedSpace | null;
  children: ExtendedSpace[];
  filters: { minScore: number; onlyMembers: boolean };
  plugins: Record<string, any>;
  validation: SpaceValidation;
  voteValidation: VoteValidation;
  treasuries: TreasuryAsset[];
  template: string;
  guidelines: string;
  verified: boolean;
  flagged: boolean;
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

export interface ProposalSpace {
  id: string;
  name: string;
  members: string[];
  avatar: string;
  symbol: string;
  verified: boolean;
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
  validation: VoteValidation;
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
  flagged: boolean;
}

export interface VoteValidation {
  name: string;
  params: Record<string, any>;
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

export interface VoteFilters {
  orderDirection: string;
  onlyWithReason: boolean;
}

// Execution

export type ABI = string | Array<Fragment | JsonFragment | string>;

export interface PendingTransaction {
  id: string;
  network: string;
  createdAt: number;
  hash: string | null;
}

export interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: string;
  nonce: string;
}

export interface RealityOracleProposal {
  dao: string;
  oracle: string;
  cooldown: number;
  expiration: number;
  proposalId: string;
  questionId: string | undefined;
  executionApproved: boolean;
  finalizedAt: number | undefined;
  nextTxIndex: number | undefined;
  transactions: SafeTransaction[];
  txHashes: string[];
  currentBond: BigNumber | undefined;
  isApproved: boolean;
  endTime: number | undefined;
}

export interface UmaOracleProposal {
  dao: string;
  oracle: string;
  rules: string;
  expiration: number;
  proposalId: string;
  transactions: SafeTransaction[];
  minimumBond: BigNumber | number | undefined;
  explanation: string;
  allowance: BigNumber | number | undefined;
  collateral: string;
  decimals: number;
  symbol: string;
  userBalance: BigNumber | number | undefined;
}

export interface SafeAsset {
  address: string;
  name: string;
  logoUri?: string;
}

export interface CollectableAsset extends SafeAsset {
  id: string;
  tokenName?: string;
}

export interface TokenAsset extends SafeAsset {
  symbol: string;
  decimals: number;
  balance: string;
  verified?: any;
  chainId?: number;
}

export interface CollectableAssetTransaction extends SafeTransaction {
  type: 'transferNFT';
  recipient: string;
  collectable: CollectableAsset;
}

export interface TokenAssetTransaction extends SafeTransaction {
  type: 'transferFunds';
  amount: string;
  recipient: any;
  token: TokenAsset;
}

export interface CustomContractTransaction extends SafeTransaction {
  type: 'contractInteraction';
  abi: string[];
}

export interface SafeModuleTransactionBatch {
  hash: string;
  transactions: SafeTransaction[];
}

export interface SafeExecutionData {
  hash: string | null;
  txs: SafeModuleTransactionBatch[];
  network: string;
  realityModule: string;
}

export interface Plugin {
  name: string;
  author: string;
  version: string;
  defaults?: any;
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
