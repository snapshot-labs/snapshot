<script setup lang="ts">
import {
  Transaction,
  TransactionType,
  createEmptyTransaction
} from '@/helpers/transactionBuilder';
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  transactionType: TransactionType;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'addTransaction', transaction: Transaction): void;
}>();

const transaction = computed<Transaction>(() =>
  createEmptyTransaction(props.transactionType)
);
</script>

<template>
  <BaseModal :open="isOpen" @close="$emit('close')">
    <template #header>
      <h3>Add transaction (type: {{ transactionType }})</h3>
    </template>
    {{ transaction }}
    <template #footer>
      <BaseButton
        class="w-full"
        primary
        @click="$emit('addTransaction', transaction), $emit('close')"
      >
        add transaction
      </BaseButton>
    </template>
  </BaseModal>
</template>
