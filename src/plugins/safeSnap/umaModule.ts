import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { UMA_MODULE_ABI } from './constants';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { Transaction } from '@/helpers/transactionBuilder';
import { AbstractSafeModule } from '@/helpers/safe';

export class UmaModule extends AbstractSafeModule {
  async setSafeAddress(): Promise<void> {
    const provider: StaticJsonRpcProvider = getProvider(this.network);
    this.safeAddress = await call(provider, UMA_MODULE_ABI, [
      this.address,
      'avatar',
      []
    ]);
  }

  async *proposeTransactions(batches: Transaction[][]) {
    yield;
  }

  async *executeTransactions(batches: Transaction[][]) {
    yield;
  }
}
