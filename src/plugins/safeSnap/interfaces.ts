import { Fragment, JsonFragment } from '@ethersproject/abi';
import { BigNumberish } from '@ethersproject/bignumber';

export type ABI = string | Array<Fragment | JsonFragment | string>;
export enum SafeTransactionOperationType {
  CALL,
  DELEGATECALL
}

export interface SafeTransaction {
  to: string;
  value: BigNumberish;
  data: string;
  operation: SafeTransactionOperationType;
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
  minimumBond: BigNumberish;
  currentBond: BigNumberish | undefined;
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

export interface SafeExecutionForm {
  safes: SafeExecutionData[];
  isValid: boolean;
}

export interface SafeExecutionStatus {
  batchError:
    | undefined
    | {
        num: number;
        message: string;
      };
}
