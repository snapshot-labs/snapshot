<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { keccak256 } from '@ethersproject/solidity';
import { useTransactionBuilder } from '@/composables';
import {
  TransactionForms,
  Transaction,
  detectTransactionForm
} from '@/helpers/transactionBuilder';
import { CollectableAsset, FundsAsset } from '@/helpers/safe';

const props = defineProps<{
  title: string;
  network: string;
  initialBatches: Transaction[][];
  defaultFromAddress: string;
  getAvailableFunds(): Promise<FundsAsset[]>;
  getAvailableCollectables(): Promise<CollectableAsset[]>;
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

const loadingAvailableAssets = ref<boolean>(true);
const availableFunds = ref<FundsAsset[]>([]);
const availableCollectables = ref<CollectableAsset[]>([]);

onMounted(async () => {
  availableFunds.value = await props.getAvailableFunds();
  availableCollectables.value = await props.getAvailableCollectables();
  loadingAvailableAssets.value = false;
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
          <i-ho-plus />
        </BaseButton>
        <BaseButton v-tippy="'Import transactions'" class="!border-none" small>
          <i-ho-download />
        </BaseButton>
        <BaseButton
          v-tippy="'Remove execution instance'"
          class="-mr-3 !border-none"
          small
          @click="emit('removeTransactionBuilder')"
        >
          <i-ho-trash />
        </BaseButton>
      </template>

      <div
        v-for="(batch, batchIndex) in batches"
        :key="batchIndex"
        class="border-b last:border-b-0"
      >
        <h4 v-if="batches.length > 1" class="flex border-b py-2 pl-4 pr-2">
          Group #{{ batchIndex + 1 }}
          <BaseButton
            small
            class="ml-auto !border-none"
            @click="removeBatch(batchIndex)"
          >
            <i-ho-trash />
          </BaseButton>
        </h4>
        <TransactionBuilderAddTransaction
          @add-transaction-of-type="openEmptyForm($event, batchIndex)"
        />

        <div class="w-full overflow-hidden">
          <draggable
            :list="batch"
            :item-key="(transaction: Transaction) => keccak256(['string'], [JSON.stringify(transaction) + Math.random()])"
            v-bind="{ animation: 200 }"
            handle=".drag-handle"
          >
            <template #item="{ element, index }">
              <div class="flex border-t py-2 pl-3 pr-2">
                <div
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
                  <i-ho-pencil />
                </BaseButton>
                <BaseButton
                  small
                  class="!border-none"
                  @click="removeTransaction(batchIndex, index)"
                >
                  <i-ho-trash />
                </BaseButton>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </BaseBlock>

    <teleport to="#modal">
      <TransactionBuilderFormFunds
        :show-form="showForm === TransactionForms.FUNDS"
        :transaction="targetTransaction"
        :available-funds="availableFunds"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
      <TransactionBuilderFormNFT
        :show-form="showForm === TransactionForms.NFT"
        :transaction="targetTransaction"
        :available-collectables="availableCollectables"
        :default-from-address="props.defaultFromAddress"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
      <TransactionBuilderFormContract
        :show-form="showForm === TransactionForms.CONTRACT"
        :transaction="targetTransaction"
        :network="props.network"
        @save-transaction="saveTransaction($event)"
        @close="showForm = null"
      />
    </teleport>
  </div>
</template>
