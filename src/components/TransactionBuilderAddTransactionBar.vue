<script setup lang="ts">
import { TransactionType } from '@/helpers/transactionBuilder';

defineEmits<{
  (e: 'selectType', type: TransactionType): void;
}>();
</script>

<template>
  <div class="flex items-center justify-evenly">
    <div
      class="transaction-type-item"
      @click="$emit('selectType', TransactionType.TRANSFER_FUNDS)"
    >
      <i-ho-database class="inline" />
      Funds
    </div>
    <div
      class="transaction-type-item"
      @click="$emit('selectType', TransactionType.TRANSFER_NFT)"
    >
      <i-ho-photograph />
      NFT
    </div>
    <div
      class="transaction-type-item"
      @click="$emit('selectType', TransactionType.CONTRACT_INTERACTION)"
    >
      <i-s-smart-contract />
      Contract
    </div>
    <div
      class="transaction-type-item"
      @click="$emit('selectType', TransactionType.RAW_TRANSACTION)"
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
