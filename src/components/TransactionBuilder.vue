<script setup lang="ts">
import { ref } from 'vue';
import { useTransactionBuilder } from '@/composables';
import { SafeModule, TransactionType } from '@/helpers/transactionBuilder';

defineProps<{
  safeModule: SafeModule;
}>();

const {
  batches,
  addEmptyBatch,
  removeBatch,
  addTransaction,
  removeTransaction
} = useTransactionBuilder();

const isAddTransactionModalOpen = ref<boolean>(false);
const typeOfTransactionToAdd = ref<TransactionType>(
  TransactionType.TRANSFER_FUNDS
);
const batchToAddTransactionTo = ref<number>(0);

function openAddTransactionModal(
  transactionType: TransactionType,
  batchIndex: number
) {
  isAddTransactionModalOpen.value = true;
  typeOfTransactionToAdd.value = transactionType;
  batchToAddTransactionTo.value = batchIndex;
}
</script>

<template>
  <div>
    <BaseBlock
      :title="`${safeModule.moduleType} (${safeModule.moduleAddress})`"
      slim
    >
      <template #title-buttons>
        <div class="ml-auto space-x-2">
          <BaseButton small @click="addEmptyBatch">
            {{ batches.length === 1 ? 'Group transactions' : 'Add group' }}
          </BaseButton>
          <BaseButton small> Import </BaseButton>
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
          @select-type="openAddTransactionModal($event, batchIndex)"
        />
        <div
          v-for="(transaction, transactionIndex) in batch"
          :key="transactionIndex"
          class="flex border-t px-4 py-2"
        >
          {{ transaction.type }}
          <BaseButton
            small
            class="ml-auto"
            @click="removeTransaction(batchIndex, transactionIndex)"
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
      <TransactionBuilderAddTransactionModal
        :is-open="isAddTransactionModalOpen"
        :transaction-type="typeOfTransactionToAdd"
        @close="isAddTransactionModalOpen = false"
        @addTransaction="addTransaction(batchToAddTransactionTo, $event)"
      />
    </teleport>
  </div>
</template>
