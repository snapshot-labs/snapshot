import { DelegateWithPercent } from '@/helpers/interfaces';

export type DelegationReader = {
  getDelegates(
    first: number,
    skip: number,
    orderBy: string
  ): Promise<DelegateWithPercent[]>;
  getDelegate(id: string): Promise<DelegateWithPercent>;
  getBalance(id: string): Promise<string>;
  getDelegatingTo(address: string): Promise<DelegatingTo>;
};

export type DelegationWriter = {
  sendSetDelegationTx: (
    addresses: string[],
    ratio?: number[],
    expirationTimestamp?: number
  ) => Promise<any>;
  sendClearDelegationsTx?: () => Promise<any>;
};

export type DelegatingTo = {
  delegates: string[];
  delegateTree?: DelegateTreeItem[];
};

export type DelegateTreeItem = {
  delegate: string;
  weight: number;
  delegatedPower: number;
  children: DelegateTreeItem[];
};

export type DelegatorTreeItem = {
  delegator: string;
  weight: number;
  delegatedPower: number;
  parents: [];
};
