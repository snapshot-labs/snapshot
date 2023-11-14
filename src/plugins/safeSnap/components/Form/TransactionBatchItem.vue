<script setup lang="ts">
import { watch, ref } from 'vue';
import { SafeTransaction, SafeTransactionConfig } from '@/helpers/interfaces';
import SafeSnapFormTransaction from './Transaction.vue';
import SafeSnapModalSingleTransaction from '../Modal/SingleTransaction.vue';
import { SimulationState } from '../Simulation/Tenderly.vue';

type TransactionWithType = {
  type: 'standard' | 'connext';
  transactions: SafeTransaction | SafeTransaction[];
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
const showModal = ref(props.showSingleTransactionModal);
const transactionBatchType = ref<'standard' | 'connext'>('standard');
const simulationState = ref<SimulationState>();

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

  // Create connext transactions group
  const connextPairs = newTransactions
    .filter(tx => tx.transactionBatchType === 'connext')
    .reduce<SafeTransaction[][]>((acc, current, _index, array) => {
      if (current.type === 'contractInteraction') {
        const next = array.find(
          t =>
            t.type === 'raw' &&
            parseInt(t.nonce) === parseInt(current.nonce) + 1
        );
        if (next) {
          acc.push([current, next]);
        }
      }
      return acc;
    }, []);

  // Get standard transactions
  const standardTransactions = newTransactions.filter(
    tx => tx.transactionBatchType === 'standard' || !tx.transactionBatchType
  );

  // Combine and tag transactions
  const combinedTransactions: TransactionWithType[] = [
    ...connextPairs.map(pair => ({
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

const removeConnextItem = (index: number) => {
  const connextTransactionToRemove = allTransactions.value[index]
    .transactions as SafeTransaction[];
  if (connextTransactionToRemove.length) {
    connextTransactionToRemove.forEach(tx => {
      const indexToRemove = props.transactions.findIndex(
        transaction => transaction.nonce === tx.nonce
      );
      if (indexToRemove !== -1) {
        emits('remove', indexToRemove);
      }
    });
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

const handleConnextEdit = (transactions: SafeTransaction[]) => {
  console.log('handleConnextEdit -', transactions);
  transactionToEdit.value = {
    transaction: transactions
  };
  showModal.value = true;
};
const handleCloseModal = () => {
  showModal.value = false;
  resetTransactionToEdit();
  emits('onCloseModal');
};

const handleFormUpdate = (
  index: number,
  transaction: SafeTransaction,
  oldTransaction: SafeTransaction | SafeTransaction[]
) => {
  console.log('oldTransaction', oldTransaction);
  if (transaction.transactionBatchType) {
    transactionBatchType.value = transaction.transactionBatchType;
  }
  //if oldTransaction is connext
  if (Array.isArray(oldTransaction)) {
    const nonce = oldTransaction[0].nonce;
    const nonceToRemove = oldTransaction[1].nonce;
    const indexToRemove = props.transactions.findIndex(
      transaction => transaction.nonce === nonceToRemove
    );
    if (indexToRemove !== -1) {
      emits('remove', indexToRemove);
    }
    const indexToUpd = props.transactions.findIndex(
      transaction => transaction.nonce === nonce
    );
    if (indexToUpd !== -1) {
      transaction.nonce = indexToUpd as unknown as string;
      return emits('update:modelValue', { index: indexToUpd, transaction });
    }
  } else {
    emits('update:modelValue', { index, transaction });
  }
};

const handleConnextFormUpdate = (transactions: SafeTransaction[]) => {
  console.log('handleConnextFormUpdate', transactions);
  transactionBatchType.value = 'connext';
  transactions.forEach(tx =>
    emits('update:modelValue', { index: tx.nonce, transaction: tx })
  );
};

const generateNonce = () => {
  let maxNonce = -1; // Inicializar en -1 para que si no hay transacciones, el resultado sea 0

  allTransactions.value.forEach(transactionWithType => {
    if (Array.isArray(transactionWithType.transactions)) {
      transactionWithType.transactions.forEach(tx => {
        const currentNonce = parseInt(tx.nonce);
        if (currentNonce > maxNonce) {
          maxNonce = currentNonce;
        }
      });
    } else {
      const currentNonce = parseInt(transactionWithType.transactions.nonce);
      if (currentNonce > maxNonce) {
        maxNonce = currentNonce;
      }
    }
  });

  return maxNonce + 1; // Esto será 0 si no hay transacciones
};

const getNonce = (batch: SafeTransaction | SafeTransaction[]): string => {
  if (batch) {
    let nonceValue = '';
    if (Array.isArray(batch)) {
      nonceValue = batch[0]?.nonce;
    } else {
      nonceValue = batch.nonce;
    }

    // Verificar que nonceValue sea un string que representa un número
    if (nonceValue && !isNaN(parseInt(nonceValue))) {
      return nonceValue;
    }
  }
  return generateNonce().toString(); // Esto devolverá '0' si no hay transacciones
};
</script>

<template>
  <div class="mt-3">
    {{
      console.log(
        'parseInt(getNonce(transactionToEdit.transaction)',
        getNonce(transactionToEdit.transaction)
      )
    }}
    <div
      v-for="(batch, index) in allTransactions"
      :key="index"
      class="transaction-batch-item-container mb-2"
    >
      <template v-if="Array.isArray(batch.transactions)">
        <SafeSnapFormTransaction
          :connext-model-value="batch.transactions"
          :config="props.config"
          :is-details="true"
          :nonce="batch.transactions[0].nonce"
          :transaction-type="'connext'"
          :simulation-state="simulationState"
          @remove="removeConnextItem(index)"
          @edit="handleConnextEdit(batch.transactions)"
        />
      </template>
      <template v-else>
        <SafeSnapFormTransaction
          :model-value="batch.transactions"
          :config="props.config"
          :nonce="
            batch.transactions ? (batch.transactions as SafeTransaction ).nonce : index
          "
          :is-details="true"
          :transaction-type="'standard'"
          @remove="
            removeStandardItem((batch.transactions as SafeTransaction).nonce)
          "
          @edit="
            handleStandardEdit(
              batch.transactions as SafeTransaction,
              (batch.transactions as SafeTransaction).nonce
            )
          "
        />
      </template>
    </div>

    <teleport to="#modal" v-if="transactionToEdit">
      {{ console.log('transactionToEdit', transactionToEdit) }}
      <SafeSnapModalSingleTransaction
        :standard-model-value="(!Array.isArray(transactionToEdit.transaction) ? transactionToEdit.transaction : {} as SafeTransaction)"
        :connext-model-value="
          Array.isArray(transactionToEdit.transaction)
            ? transactionToEdit.transaction
            : []
        "
        :nonce="parseInt(getNonce(transactionToEdit.transaction))"
        :open="showModal"
        :config="config"
        @update:modelValue="
          handleFormUpdate(
            transactionToEdit.nonce ?? 0,
            $event,
            transactionToEdit.transaction
          )
        "
        @update:connextModelValue="handleConnextFormUpdate($event)"
        @close="handleCloseModal"
        @update:simulation-state="simulation => (simulationState = simulation)"
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
