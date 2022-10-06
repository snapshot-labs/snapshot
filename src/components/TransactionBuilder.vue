<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { keccak256 } from '@ethersproject/solidity';
import { useTransactionBuilder } from '@/composables';
import {
  TransactionForms,
  Transaction,
  detectTransactionForm
} from '@/helpers/transactionBuilder';
import { Safe } from '@/helpers/safe';

const props = defineProps<{
  safe: Safe;
  initialBatches: Transaction[][];
}>();

const emit = defineEmits<{
  (e: 'updateBatches', batches: Transaction[][]): void;
  (e: 'removeTransactionBuilder'): void;
}>();

const {
  batches,
  addEmptyBatch,
  removeBatch,
  addTransaction,
  removeTransaction,
  updateTransaction
} = useTransactionBuilder(props.initialBatches);

watch(
  batches,
  () => {
    emit('updateBatches', batches.value);
  },
  { deep: true }
);

const showForm = ref<TransactionForms | null>(null);
const targetBatchIndex = ref<number>(0);
const targetTransactionIndex = ref<number | null>(null);
const targetTransaction = computed<Transaction | null>(() => {
  if (targetTransactionIndex.value === null) return null;
  return batches.value[targetBatchIndex.value][targetTransactionIndex.value];
});

function openEmptyForm(form: TransactionForms, batchIndex: number) {
  targetBatchIndex.value = batchIndex;
  targetTransactionIndex.value = null;
  showForm.value = form;
}

function openEditForm(batchIndex: number, transactionIndex: number) {
  targetBatchIndex.value = batchIndex;
  targetTransactionIndex.value = transactionIndex;
  showForm.value = detectTransactionForm(targetTransaction.value!);
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

function transactionItemKey(transaction: Transaction) {
  return keccak256(['string'], [JSON.stringify(transaction) + Math.random()]);
}
</script>

<template>
  <div>
    <BaseBlock
      :title="`${safe.name} (${safe.network}, ${safe.address.slice(0, 6)})`"
      slim
    >
      <template #title-buttons>
        <BaseButton
          v-tippy="'Add transaction group'"
          class="ml-auto !border-none"
          small
          @click="addEmptyBatch"
        >
          <i-ho-folder-add width="20" height="20" />
        </BaseButton>
        <BaseButton v-tippy="'Import transactions'" class="!border-none" small>
          <i-ho-download width="20" height="20" />
        </BaseButton>
        <BaseButton
          v-tippy="'Remove execution instance'"
          class="-mr-3 !border-none"
          small
          @click="emit('removeTransactionBuilder')"
        >
          <i-ho-trash width="20" height="20" />
        </BaseButton>
      </template>

      <div
        v-for="(batch, batchIndex) in batches"
        :key="batchIndex"
        class="border-b last:border-b-0"
      >
        <h4 v-if="batches.length > 1" class="flex py-2 pl-4 pr-2">
          Transaction group #{{ batchIndex + 1 }}
          <div class="ml-auto">
            <BaseButton
              v-tippy="'Transfer funds'"
              small
              class="!border-none"
              @click="openEmptyForm(TransactionForms.FUNDS, batchIndex)"
            >
              <i-ho-database width="20" height="20" />
            </BaseButton>
            <BaseButton
              v-tippy="'Transfer collectable'"
              small
              class="!border-none"
              @click="openEmptyForm(TransactionForms.NFT, batchIndex)"
            >
              <i-ho-photograph width="20" height="20" />
            </BaseButton>
            <BaseButton
              v-tippy="'Custom contract'"
              small
              class="!border-none"
              @click="openEmptyForm(TransactionForms.CONTRACT, batchIndex)"
            >
              <i-s-smart-contract width="20" height="20" />
            </BaseButton>
            <BaseButton
              v-tippy="'Remove transaction group'"
              small
              class="!border-none"
              @click="removeBatch(batchIndex)"
            >
              <i-ho-trash width="20" height="20" />
            </BaseButton>
          </div>
        </h4>

        <TransactionBuilderAddTransaction
          v-if="batches.length === 1"
          @add-transaction-of-type="openEmptyForm($event, batchIndex)"
        />

        <div class="w-full overflow-hidden">
          <draggable
            :list="batch"
            :item-key="transactionItemKey"
            v-bind="{ animation: 200 }"
            handle=".drag-handle"
          >
            <template #item="{ element, index }">
              <div class="flex border-t py-2 pl-3 pr-2">
                <div
                  v-if="batch.length > 1"
                  class="drag-handle flex cursor-grab items-center active:cursor-grabbing"
                >
                  <BaseIcon name="draggable" size="16" class="mr-[12px]" />
                </div>
                <TransactionBuilderDisplayTransaction :transaction="element" />
                <BaseButton
                  small
                  class="ml-auto !border-none"
                  @click="openEditForm(batchIndex, index)"
                >
                  <i-ho-pencil width="20" height="20" />
                </BaseButton>
                <BaseButton
                  small
                  class="!border-none"
                  @click="removeTransaction(batchIndex, index)"
                >
                  <i-ho-trash width="20" height="20" />
                </BaseButton>
              </div>
            </template>
          </draggable>
        </div>

        <div
          v-if="batch.length === 0 && batches.length > 1"
          class="border-t p-3 text-center"
        >
          No transactions in this group yet.
        </div>
      </div>
    </BaseBlock>

    <teleport to="#modal">
      <TransactionBuilderFormFunds
        :show-form="showForm === TransactionForms.FUNDS"
        :transaction="targetTransaction"
        :safe="safe"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
      <TransactionBuilderFormNFT
        :show-form="showForm === TransactionForms.NFT"
        :transaction="targetTransaction"
        :safe="safe"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
      <TransactionBuilderFormContract
        :show-form="showForm === TransactionForms.CONTRACT"
        :transaction="targetTransaction"
        :safe="safe"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
    </teleport>
  </div>
</template>
