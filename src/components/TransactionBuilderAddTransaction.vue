<script setup lang="ts">
import { TransactionForms } from '@/helpers/transactionBuilder';

defineEmits<{
  (e: 'addTransactionOfType', type: TransactionForms): void;
}>();
</script>

<template>
  <div class="flex items-center justify-evenly">
    <div
      class="transaction-type-item"
      @click="$emit('addTransactionOfType', TransactionForms.FUNDS)"
    >
      <i-ho-database />
      Transfer funds
    </div>
    <div
      class="transaction-type-item"
      @click="$emit('addTransactionOfType', TransactionForms.NFT)"
    >
      <i-ho-photograph />
      Transfer NFT
    </div>
    <div
      class="transaction-type-item"
      @click="$emit('addTransactionOfType', TransactionForms.CONTRACT)"
    >
      <i-s-smart-contract />
      Custom contract
    </div>
  </div>
</template>

<style scoped>
.transaction-type-item {
  @apply flex h-[64px] grow cursor-pointer flex-col items-center justify-center hover:bg-skin-border;
}
</style>
