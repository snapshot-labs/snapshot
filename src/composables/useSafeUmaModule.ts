import { ModuleExecutionData } from '@/helpers/safe';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export function useSafeUmaModule(
  executionData: ModuleExecutionData,
  proposalId: string
) {
  const readProvider = getProvider(executionData.safe.network);

  async function* proposeTransactions() {
    yield;
  }

  async function* disputeTransactions() {
    yield;
  }

  async function* executeTransactions() {
    yield;
  }

  return {
    proposeTransactions,
    disputeTransactions,
    executeTransactions
  };
}
