<script setup lang="ts">
import { watch, ref } from 'vue';
import { SafeTransaction, SafeTransactionConfig } from '@/helpers/interfaces';
import SafeSnapFormTransaction from './Transaction.vue';
import SafeSnapModalSingleTransaction from '../Modal/SingleTransaction.vue';

type TransactionWithType = {
  type: 'standard' | 'connext';
  transactions: SafeTransaction;
};

type TransactionBatchItemProps = {
  transactions: SafeTransaction[];
  showSingleTransactionModal: boolean;
  config: SafeTransactionConfig;
};

type TransactionToEditType = {
  transaction: SafeTransaction | SafeTransaction[];
  nonce?: number;
};

const props = defineProps<TransactionBatchItemProps>();
const emits = defineEmits(['update:modelValue', 'remove', 'onCloseModal']);
const transactionToEdit = ref<TransactionToEditType>({
  transaction: {} as SafeTransaction,
  nonce: props.transactions.length > 0 ? props.transactions.length : 0
});
const allTransactions = ref<TransactionWithType[]>([]);
const showModal = ref<boolean>(props.showSingleTransactionModal);
const transactionBatchType = ref<'standard' | 'connext'>('standard');

watch(
  () => props.showSingleTransactionModal,
  (newVal: boolean) => {
    if (newVal !== showModal.value) {
      showModal.value = newVal;
    }
  }
);

watch(
  () => props.transactions,
  (newTransactions: SafeTransaction[]) => {
    const newTransactionIndex = newTransactions.length;
    if (showModal.value) {
      transactionToEdit.value = {
        transaction: {} as SafeTransaction,
        nonce: newTransactionIndex
      };
    }
  }
);

watchEffect(() => {
  const newTransactions = props.transactions;

  // Get standard transactions
  const connextTransactions = newTransactions.filter(
    tx => tx.transactionBatchType === 'connext' || !tx.transactionBatchType
  );
  // Get standard transactions
  const standardTransactions = newTransactions.filter(
    tx => tx.transactionBatchType === 'standard' || !tx.transactionBatchType
  );
  // Combine and tag transactions
  const combinedTransactions: TransactionWithType[] = [
    ...connextTransactions.map(pair => ({
      type: 'connext' as const,
      transactions: pair
    })),
    ...standardTransactions.map(tx => ({
      type: 'standard' as const,
      transactions: tx
    }))
  ];

  // Sort combined transactions
  const sortedTransactions = combinedTransactions.sort((a, b) => {
    const nonceA = Array.isArray(a.transactions)
      ? parseInt(a.transactions[0].nonce)
      : parseInt(a.transactions.nonce);
    const nonceB = Array.isArray(b.transactions)
      ? parseInt(b.transactions[0].nonce)
      : parseInt(b.transactions.nonce);
    return nonceA - nonceB;
  });

  allTransactions.value = sortedTransactions;
});

const removeStandardItem = (nonce: string) => {
  const indexToRemove = props.transactions.findIndex(tx => tx.nonce === nonce);
  if (indexToRemove !== -1) {
    emits('remove', indexToRemove);
  }
};

const resetTransactionToEdit = () => {
  transactionToEdit.value = {
    transaction: {} as SafeTransaction,
    nonce: props.transactions.length
  };
};

const handleStandardEdit = (transaction: SafeTransaction, nonce: string) => {
  transactionToEdit.value = {
    transaction,
    nonce: parseInt(nonce)
  };
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
  resetTransactionToEdit();
  emits('onCloseModal');
  transactionBatchType.value = 'standard';
};

const handleFormUpdate = (nonce: number, transaction: SafeTransaction) => {
  transactionBatchType.value = transaction.type as 'standard' | 'connext';

  if (transaction.transactionBatchType) {
    transactionBatchType.value = transaction.transactionBatchType;
  }
  if (props.transactions.length < nonce) {
    removeStandardItem(nonce.toString());
    let netTransaction = transaction;
    const index = props.transactions.findIndex(
      t => parseInt(t.nonce) === nonce
    );
    netTransaction.nonce = index.toString();
    return emits('update:modelValue', { index, transaction });
  }

  emits('update:modelValue', { index: nonce, transaction });
};

const generateNonce = () => {
  let maxNonce = -1; // Initialize to -1 so that if there are no transactions, the result is 0

  allTransactions.value.forEach(transactionWithType => {
    const currentNonce = parseInt(transactionWithType.transactions.nonce);
    if (currentNonce > maxNonce) {
      maxNonce = currentNonce;
    }
  });

  return maxNonce + 1; // This will be 0 if there are no transactions
};

const getNonce = (batch: SafeTransaction | SafeTransaction[]): string => {
  if (
    transactionToEdit.value.nonce !== undefined &&
    transactionToEdit.value.nonce !== null
  ) {
    return transactionToEdit.value.nonce.toString();
  }

  if (batch) {
    let nonceValue = '';
    if (Array.isArray(batch)) {
      nonceValue = batch[0]?.nonce;
    } else {
      nonceValue = batch.nonce;
    }

    if (nonceValue && !isNaN(parseInt(nonceValue))) {
      return nonceValue;
    }
  }
  return generateNonce().toString();
};
</script>

<template>
  <div class="mt-3">
    <div
      v-for="(batch, index) in allTransactions"
      :key="index"
      class="transaction-batch-item-container mb-2"
    >
      <SafeSnapFormTransaction
        :key="`form-transaction-${index}`"
        :model-value="batch.transactions"
        :config="props.config"
        :nonce="batch.transactions ? batch.transactions.nonce : index"
        :is-details="true"
        :transaction-type="batch.type"
        @remove="removeStandardItem(batch.transactions.nonce)"
        @edit="handleStandardEdit(batch.transactions, batch.transactions.nonce)"
      />
    </div>

    <teleport to="#modal" v-if="transactionToEdit">
      <SafeSnapModalSingleTransaction
        :standard-model-value="
          !Array.isArray(transactionToEdit.transaction)
            ? transactionToEdit.transaction
            : ({} as SafeTransaction)
        "
        :connext-model-value="
          !Array.isArray(transactionToEdit.transaction)
            ? transactionToEdit.transaction
            : ({} as SafeTransaction)
        "
        :nonce="parseInt(getNonce(transactionToEdit.transaction))"
        :open="showModal"
        :config="config"
        @update:modelValue="
          handleFormUpdate(transactionToEdit.nonce ?? 0, $event)
        "
        @update:connextModelValue="
          handleFormUpdate(transactionToEdit.nonce ?? 0, $event)
        "
        @close="handleCloseModal"
      />
    </teleport>
  </div>
</template>

<style lang="scss">
.transaction-batch-item-container {
  background: var(--border-color);
  border-radius: 23px;
}
</style>
