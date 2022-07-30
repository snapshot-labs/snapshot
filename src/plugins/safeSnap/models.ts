import { BigNumber } from '@ethersproject/bignumber';
import { Fragment, JsonFragment } from '@ethersproject/abi';

export type ABI = string | Array<Fragment | JsonFragment | string>;

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
