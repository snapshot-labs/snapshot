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

export type Token = {
  symbol: string;
  decimals: number;
  address: "main" | (string & {});
}