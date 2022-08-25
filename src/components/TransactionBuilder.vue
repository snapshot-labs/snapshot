<script setup lang="ts">
import { provide, ref, watch } from 'vue';
import { useTransactionBuilder } from '@/composables';
import { Transaction } from '@/helpers/transactionBuilder';
import { CollectableAsset, TokenAsset } from '@/helpers/safe';

const props = defineProps<{
  title: string;
  availableFunds: TokenAsset[];
  availableCollectables: CollectableAsset[];
}>();

provide('availableFunds', props.availableFunds);
provide('availableCollectables', props.availableCollectables);

const emit = defineEmits<{
  (e: 'updateBatches', batches: Transaction[][]): void;
  (e: 'removeTransactionBuilder'): void;
}>();

const {
  batches,
  addEmptyBatch,
  removeBatch,
  addTransaction,
  updateTransaction,
  removeTransaction
} = useTransactionBuilder();

watch(batches, () => {
  emit('updateBatches', batches.value as Transaction[][]);
});

const isTransactionFormModalOpen = ref<boolean>(false);
const targetBatchIndex = ref<number>(0);
const targetTransactionIndex = ref<number | null>(0);
const targetTransaction = ref<Transaction | null>(null);

function openTransactionFormModal(
  transaction: Transaction,
  batchIndex: number,
  transactionIndex: number | null = null
) {
  targetTransaction.value = transaction;
  targetBatchIndex.value = batchIndex;
  targetTransactionIndex.value = transactionIndex;
  isTransactionFormModalOpen.value = true;
}

function saveTransaction(transaction: Transaction) {
  if (targetTransactionIndex.value === null) {
    addTransaction(targetBatchIndex.value, transaction);
  } else {
    updateTransaction(
      targetBatchIndex.value,
      targetTransactionIndex.value,
      transaction
    );
  }
}
</script>

<template>
  <div>
    <BaseBlock :title="title" slim>
      <template #title-buttons>
        <div class="ml-auto space-x-2">
          <BaseButton small @click="addEmptyBatch">
            {{ batches.length === 1 ? 'Group transactions' : 'Add group' }}
          </BaseButton>
          <BaseButton small> Import </BaseButton>
          <BaseButton small @click="$emit('removeTransactionBuilder')">
            <i-ho-x class="inline" />
          </BaseButton>
        </div>
      </template>
      <div
        v-for="(batch, batchIndex) in batches"
        :key="batchIndex"
        class="border-b last:border-b-0"
      >
        <h4 v-if="batches.length > 1" class="flex border-b px-4 py-2">
          Group #{{ batchIndex + 1 }}
          <BaseButton small class="ml-auto" @click="removeBatch(batchIndex)">
            <i-ho-x />
          </BaseButton>
        </h4>
        <TransactionBuilderAddTransactionBar
          @add-transaction="openTransactionFormModal($event, batchIndex)"
        />
        <div
          v-for="(transaction, transactionIndex) in batch"
          :key="transactionIndex"
          class="flex border-t px-4 py-2"
        >
          {{ transaction }}
          <BaseButton
            small
            class="ml-auto"
            @click="
              openTransactionFormModal(
                transaction,
                batchIndex,
                transactionIndex
              )
            "
          >
            <i-ho-pencil />
          </BaseButton>
          <BaseButton
            small
            class="ml-2"
            @click="removeTransaction(batchIndex, transactionIndex)"
          >
            <i-ho-x />
          </BaseButton>
        </div>
      </div>
    </BaseBlock>

    <teleport to="#modal">
      <TransactionBuilderTransactionFormModal
        v-if="targetTransaction"
        :is-open="isTransactionFormModalOpen"
        :transaction="targetTransaction"
        @close="isTransactionFormModalOpen = false"
        @save-transaction="saveTransaction($event)"
      />
    </teleport>
  </div>
</template>
