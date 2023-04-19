import { useStorage } from '@vueuse/core';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { PendingTransaction } from '@/helpers/interfaces';

const PENDING_TRANSACTIONS_STORAGE_KEY = 'snapshot.pendingTransactions';
const pendingTransactions = useStorage(
  PENDING_TRANSACTIONS_STORAGE_KEY,
  [] as PendingTransaction[]
);

export function useTxStatus() {
  const createPendingTransaction = () => {
    const createdAt = Date.now();
    const id = createdAt.toString();
    const tx = {
      id,
      network: '1',
      createdAt,
      txId: null
    };
    pendingTransactions.value.push(tx);
    return id;
  };

  const updatePendingTransaction = (
    id: string,
    payload: Partial<PendingTransaction>
  ) => {
    const tx = pendingTransactions.value.find(tx => tx.id === id);
    if (tx) {
      Object.assign(tx, payload);
    }
  };

  const removePendingTransaction = (id: string) => {
    const tx = pendingTransactions.value.find(tx => tx.id === id);
    if (tx) {
      pendingTransactions.value = pendingTransactions.value.filter(
        tx => tx.id !== id
      );
    }
  };

  const restorePendingTransactions = () => {
    pendingTransactions.value.forEach(async tx => {
      if (tx.txId) {
        if (Date.now() > tx.createdAt + 1000 * 60)
          return removePendingTransaction(tx.id);
        try {
          const provider = getProvider(tx.network);
          await provider.waitForTransaction(tx.txId, 1, 1000 * 60 * 4);
        } finally {
          removePendingTransaction(tx.id);
        }
      } else {
        if (Date.now() > tx.createdAt + 1000 * 10)
          return removePendingTransaction(tx.id);
      }
    });
  };

  return {
    pendingTransactions,
    createPendingTransaction,
    updatePendingTransaction,
    removePendingTransaction,
    restorePendingTransactions
  };
}
