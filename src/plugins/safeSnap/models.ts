import { BigNumber } from '@ethersproject/bignumber';
import { Fragment, JsonFragment } from '@ethersproject/abi';

export type ABI = string | Array<Fragment | JsonFragment | string>;

export interface ModuleTransaction {
  to: string;
  value: string;
  data: string;
  operation: string;
  nonce: string;
}

export interface ProposalDetails {
  dao: string;
  oracle: string;
  cooldown: number;
  proposalId: string;
  questionId: string | undefined;
  executionApproved: boolean;
  finalizedAt: number | undefined;
  nextTxIndex: number | undefined;
  transactions: ModuleTransaction[];
  txHashes: string[];
  currentBond: BigNumber | undefined;
  isApproved: boolean;
  endTime: number | undefined;
}

export interface Collectable {
  id: string;
  name: string;
  address: string;
  tokenName?: string;
  logoUri?: string;
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
}

export interface SendAssetModuleTransaction extends ModuleTransaction {
  type: 'transferNFT';
  recipient: string;
  collectable: Collectable;
}

export interface TransferFundsModuleTransaction extends ModuleTransaction {
  type: 'transferFunds';
  amount: string;
  recipient: any;
  token: Token;
}

export interface ContractInteractionModuleTransaction
  extends ModuleTransaction {
  type: 'contractInteraction';
  abi: string[];
}

export interface Batch {
  hash: string;
  transactions: ModuleTransaction[];
}

export interface SafeData {
  hash: string | null;
  txs: Batch[];
  network: string;
  realityModule: string;
}
