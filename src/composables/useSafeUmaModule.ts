import { UMA_MODULE_ABI } from '@/helpers/abi';
import { ModuleExecutionData } from '@/helpers/safe';
import {
  convertToRawTransaction,
  createMultiSendTx,
  getMultiSendAddress
} from '@/helpers/transactionBuilder';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export function useSafeUmaModule(
  executionData: ModuleExecutionData,
  proposalId: string
) {
  const readProvider = getProvider(executionData.safe.network);

  async function* proposeTransactions() {
    const transactions = executionData.batches
      .map((batch, nonce) => {
        if (batch.length === 1) {
          return convertToRawTransaction(batch[0]);
        } else if (batch.length > 1) {
          return createMultiSendTx(
            batch.map(transaction => convertToRawTransaction(transaction)),
            nonce.toString(),
            getMultiSendAddress(executionData.safe.network)
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
