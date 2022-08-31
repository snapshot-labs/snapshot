<script setup lang="ts">
import {
  isCollectableTransaction,
  isTokenTransaction,
  Transaction
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
      <h3>Add transaction</h3>
    </template>
    <BaseContainer class="py-4">
      <TransactionBuilderFormToken
        v-if="isTokenTransaction(transactionFormData)"
        :transaction="transactionFormData"
        @updateTransaction="transactionFormData = $event"
      />
      <TransactionBuilderFormCollectable
        v-if="isCollectableTransaction(transactionFormData)"
        :transaction="transactionFormData"
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
