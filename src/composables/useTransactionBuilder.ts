import { ref } from 'vue';
import { ExecutionDataABIs, Transaction } from '@/helpers/safe';

export function useTransactionBuilder() {
  const batches = ref<Transaction[][]>([]);
  const abis = ref<ExecutionDataABIs>({});

  function setBatches(newBatches: Transaction[][]) {
    batches.value = newBatches;
  }

  function setABIs(newAbis: ExecutionDataABIs) {
    abis.value = newAbis;
  }

  function addEmptyBatch() {
    batches.value.push([]);
  }

  function addTransaction(batchIndex: number, transaction: Transaction) {
    if (batches.value[batchIndex] === undefined) {
      batches.value[batchIndex] = [];
    }
    batches.value[batchIndex].push(transaction);
  }

  function updateTransaction(
    batchIndex: number,
    transactionIndex: number,
    transaction: Transaction
  ) {
    batches.value[batchIndex][transactionIndex] = transaction;
  }

  function removeBatch(batchIndex: number) {
    batches.value = batches.value.filter((_, index) => index !== batchIndex);

    removeUnusedABIs();
  }

  function removeTransaction(batchIndex: number, transactionIndex: number) {
    batches.value[batchIndex].splice(transactionIndex, 1);
    removeUnusedABIs();
  }

  function addABI(contract: string, abi: string) {
    abis.value[contract] = abi;
  }

  function removeUnusedABIs() {
    Object.keys(abis.value).forEach(contractAddress => {
      if (!batches.value.flat().some(tx => tx.to === contractAddress)) {
        delete abis.value[contractAddress];
      }
    });
  }

  return {
    batches,
    abis,
    setBatches,
    setABIs,
    addEmptyBatch,
    addTransaction,
    updateTransaction,
    removeBatch,
    removeTransaction,
    addABI,
    removeUnusedABIs
  };
}
