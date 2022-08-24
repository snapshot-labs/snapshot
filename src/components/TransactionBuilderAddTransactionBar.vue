<script setup lang="ts">
import {
  createEmptyTransaction,
  Transaction,
  TransactionType
} from '@/helpers/transactionBuilder';

const emit = defineEmits<{
  (e: 'addTransaction', transaction: Transaction): void;
}>();

function addTransaction(type: TransactionType) {
  emit('addTransaction', createEmptyTransaction(type));
}
</script>

<template>
  <div class="flex items-center justify-evenly">
    <div
      class="transaction-type-item"
      @click="addTransaction(TransactionType.TRANSFER_FUNDS)"
    >
      <i-ho-database class="inline" />
      Funds
    </div>
    <div
      class="transaction-type-item"
      @click="addTransaction(TransactionType.TRANSFER_NFT)"
    >
      <i-ho-photograph />
      NFT
    </div>
    <div
      class="transaction-type-item"
      @click="addTransaction(TransactionType.CONTRACT)"
    >
      <i-s-smart-contract />
      Contract
    </div>
    <div
      class="transaction-type-item"
      @click="addTransaction(TransactionType.RAW)"
    >
      <i-ho-adjustments />
      Raw
    </div>
  </div>
</template>

<style scoped>
.transaction-type-item {
  @apply flex h-[64px] grow cursor-pointer flex-col items-center justify-center hover:bg-skin-border;
}
</style>
