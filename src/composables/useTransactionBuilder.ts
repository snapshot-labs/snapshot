import { readonly, ref } from 'vue';
import { Transaction } from '@/helpers/transactionBuilder';

export function useTransactionBuilder() {
  const batches = ref<Transaction[][]>([[]]);

  function addEmptyBatch() {
    batches.value.push([]);
  }

  function addTransaction(batchIndex: number, transaction: Transaction) {
    if (batches.value[batchIndex] === undefined) {
      batches.value[batchIndex] = [];
    }
    batches.value[batchIndex].push(transaction);
  }

  function removeBatch(batchIndex: number) {
    batches.value = batches.value.filter((_, index) => index !== batchIndex);
  }

  function removeTransaction(batchIndex: number, transactionIndex: number) {
    batches.value[batchIndex].splice(transactionIndex, 1);
    if (batches.value[batchIndex].length === 0) {
      removeBatch(batchIndex);
    }
  }

  return {
    batches: readonly(batches),
    addEmptyBatch,
    addTransaction,
    removeBatch,
    removeTransaction
  };
}
