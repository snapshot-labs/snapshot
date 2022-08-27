import { AbstractExecutor } from '@/helpers/safe';

export class RealityModule extends AbstractExecutor {
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
