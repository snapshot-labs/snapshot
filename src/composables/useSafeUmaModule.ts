import { UMA_MODULE_ABI } from '@/helpers/abi';
import { Executor, ModuleExecutionData } from '@/helpers/safe';
import {
  convertToRawTransaction,
  convertBatchToMultisendTransaction
} from '@/helpers/transactionBuilder';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { reactive, readonly } from 'vue';

interface UmaModuleState {
  loading: boolean;
  oracleAddress: string | undefined;
}

export function useSafeUmaModule(
  executionData: ModuleExecutionData,
  proposalId: string
): Executor {
  const readProvider = getProvider(executionData.safe.network);

  const state = reactive<UmaModuleState>({
    loading: true,
    oracleAddress: undefined
  });

  async function setState() {
    state.loading = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    state.loading = false;
  }

  async function* proposeExecution() {
    const transactions = executionData.batches
      .map((batch, nonce) => {
        if (batch.length === 1) {
          return convertToRawTransaction(batch[0]);
        } else if (batch.length > 1) {
          return convertBatchToMultisendTransaction(
            batch.map(transaction => convertToRawTransaction(transaction)),
            executionData.safe.network
          );
        }
        return null;
      })
      .filter(transaction => transaction);

    const tx = await sendTransaction(
      getInstance().web3,
      executionData.module.address,
      UMA_MODULE_ABI,
      'proposeTransactions',
      [transactions, proposalId]
    );
    yield;
    await tx.wait();
  }

  async function* disputeExecution() {
    yield;
  }

  async function* execute() {
    yield;
  }

  function canExecute() {
    return true;
  }

  return {
    state: readonly(state),
    setState,
    proposeExecution,
    disputeExecution,
    execute,
    canExecute
  };
}
