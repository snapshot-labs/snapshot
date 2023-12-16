import { DelegateWithPercent } from '@/helpers/interfaces';

export type DelegationReader = {
  getDelegates(
    first: number,
    skip: number,
    orderBy: string
  ): Promise<DelegateWithPercent[]>;
  getDelegate(id: string): Promise<DelegateWithPercent>;
  getBalance(id: string): Promise<string>;
  getDelegatingTo(address: string): Promise<string[]>;
};

export type DelegationWriter = {
  sendSetDelegationTx: (
    addresses: string[],
    ratio?: number[],
    expirationTimestamp?: number
  ) => Promise<void>;
};
