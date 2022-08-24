<script setup lang="ts">
import {
  TokenAssetTransaction,
  Transaction,
  TransactionType
} from '@/helpers/transactionBuilder';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  transaction: Transaction;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTransaction', transaction: Transaction): void;
}>();

const transactionFormData = ref<Transaction>(props.transaction);
watch(
  () => props.isOpen,
  () => {
    transactionFormData.value = props.transaction;
  }
);

// TODO: implement actual validation
const isValidTransaction = computed(() => {
  return transactionFormData.value !== null;
});

function saveTransaction() {
  if (isValidTransaction.value) {
    emit('saveTransaction', transactionFormData.value);
    emit('close');
  }
}
</script>

<template>
  <BaseModal :open="isOpen" @close="$emit('close')">
    <template #header>
      <h3>Add transaction (type: {{ transaction.type }})</h3>
    </template>
    <BaseContainer class="min-h-[400px] py-2">
      <TransactionBuilderFormTransferFunds
        v-if="transaction.type === TransactionType.TRANSFER_FUNDS"
        :transaction="(transactionFormData as TokenAssetTransaction)"
        @updateTransaction="transactionFormData = $event"
      />
    </BaseContainer>
    <template #footer>
      <BaseButton
        class="w-full"
        primary
        :disabled="!isValidTransaction"
        @click="saveTransaction"
      >
        save
      </BaseButton>
    </template>
  </BaseModal>
</template>
