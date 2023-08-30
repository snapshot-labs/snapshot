import { SafeTransaction } from '@/helpers/interfaces';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

type Networks = typeof networks;

export type Network = keyof Networks;

export type Batch = {
  transactions: SafeTransaction[];
  mainTransaction: SafeTransaction;
};

export type OptimisticGovernorTransaction = [to: string, operation: 0 | 1, value: string, data: string];