import { CollectableAsset } from '@/helpers/interfaces';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

type Networks = typeof networks;

export type Network = keyof Networks;

export type OptimisticGovernorTransaction = [to: string, operation: 0, value: string, data: string];

export type TransactionType = 'transferFunds' | 'transferNFT' | 'contractInteraction' | 'raw';

export type Transaction = {
  to: string;
  value: string;
  data: string;
  nonce: string;
}

export type TransferNftTransaction = Transaction & {
  type: 'transferNFT';
  recipient: string;
  collectable: CollectableAsset;
}

export type TransferFundsTransaction = Transaction & {
  type: 'transferFunds';
  amount: string;
  recipient: string;
  token: Token;
}

export type Asset = {
  name: string;
  address: "main" | (string & {});
  logoUri?: string;
}

export type Token = Asset & {
  symbol: string;
  decimals: number;
  balance?: string;
  verified?: boolean;
  chainId?: Network;
}