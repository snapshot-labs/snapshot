import { AbstractExecutor } from '@/helpers/safe';

export class UmayModule extends AbstractExecutor {
  async *proposeTransactions() {
    yield;
  }

  async *executeTransactions() {
    yield;
  }

  async *disputeTransactions() {
    yield;
  }
}
