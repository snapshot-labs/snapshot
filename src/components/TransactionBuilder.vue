<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { keccak256 } from '@ethersproject/solidity';
import { useTransactionBuilder } from '@/composables';
import {
  TransactionForms,
  detectTransactionForm
} from '@/helpers/transactionBuilder';
import { ExecutionData, ExecutionDataABIs, Transaction } from '@/helpers/safe';

const props = defineProps<{
  executionData: ExecutionData;
}>();

const emit = defineEmits<{
  (e: 'updateBatches', batches: Transaction[][]): void;
  (e: 'updateAbis', abis: ExecutionDataABIs): void;
  (e: 'removeTransactionBuilder'): void;
}>();

const {
  batches,
  abis,
  addEmptyBatch,
  removeBatch,
  addTransaction,
  removeTransaction,
  updateTransaction,
  addABI,
  setBatches,
  setABIs
} = useTransactionBuilder();

setBatches(props.executionData.batches);
setABIs(props.executionData.abis || {});

watch(
  batches,
  () => {
    emit('updateBatches', batches.value);
  },
  { deep: true }
);
watch(
  abis,
  () => {
    emit('updateAbis', abis.value);
  },
  { deep: true }
);

const showForm = ref<TransactionForms | null>(null);
const showImportForm = ref(false);
const targetBatchIndex = ref<number>(0);
const targetTransactionIndex = ref<number | null>(null);
const targetTransaction = computed<Transaction | null>(() => {
  if (targetTransactionIndex.value === null) return null;
  return batches.value[targetBatchIndex.value][targetTransactionIndex.value];
});
const title = computed<string>(() => {
  return `${props.executionData.safe.name} (${
    props.executionData.safe.network
  }, ${props.executionData.safe.address.slice(0, 6)}, ${
    props.executionData.module?.type || 'manual'
  } execution)`;
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

function importData(data: {
  batches: Transaction[][];
  abis: ExecutionDataABIs;
}) {
  console.log(data);
  setBatches(data.batches);
  setABIs(data.abis);
}

function transactionItemKey(transaction: Transaction) {
  return keccak256(['string'], [JSON.stringify(transaction) + Math.random()]);
}
</script>

<template>
  <div>
    <BaseBlock :title="title" slim>
      <template #title-buttons>
        <BaseButton
          v-tippy="'Add transaction group'"
          class="ml-auto !border-none"
          small
          @click="addEmptyBatch"
        >
          <i-ho-folder-add width="20" height="20" />
        </BaseButton>
        <BaseButton
          v-tippy="'Import transactions'"
          class="!border-none"
          small
          @click="showImportForm = true"
        >
          <i-ho-download width="20" height="20" />
        </BaseButton>
        <BaseButton
          v-tippy="'Remove execution instance'"
          class="-mr-2 !border-none"
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

        <TransactionBuilderFormAddTransaction
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
                <TransactionBuilderDisplayTransaction
                  :transaction="element"
                  :network="executionData.safe.network"
                  :contract-abi="abis[element.to]"
                />
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
        :safe="executionData.safe"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
      <TransactionBuilderFormNFT
        :show-form="showForm === TransactionForms.NFT"
        :transaction="targetTransaction"
        :safe="executionData.safe"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
      <TransactionBuilderFormContract
        :show-form="showForm === TransactionForms.CONTRACT"
        :transaction="targetTransaction"
        :abis="abis"
        :safe="executionData.safe"
        @save-transaction="saveTransaction($event)"
        @save-abi="addABI($event.contractAddress, $event.abiString)"
        @close="showForm = null"
      />
      <TransactionBuilderImport
        :show-import-form="showImportForm"
        :safe-address="executionData.safe.address"
        @import-data="importData($event)"
        @close="showImportForm = false"
      />
    </teleport>
  </div>
</template>
