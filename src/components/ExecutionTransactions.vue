<script setup lang="ts">
import { ExecutionData } from '@/helpers/safe';

const props = defineProps<{
  executionData: ExecutionData;
}>();
</script>

<template>
  <div v-for="(batch, batchIndex) in executionData.batches" :key="batchIndex">
    <h5
      v-if="executionData.batches.length > 1"
      class="flex border-b py-2 pl-4 pr-2"
    >
      Group #{{ batchIndex + 1 }}
    </h5>
    <TransactionBuilderDisplayTransaction
      v-for="(transaction, transactionIndex) in batch"
      :key="transactionIndex"
      :transaction="transaction"
      :network="executionData.safe.network"
      class="border-b px-3 py-2"
    />
  </div>
</template>

<style scoped>
.transaction-type-label {
  @apply flex w-1/4 flex-col items-center justify-center;
}
</style>
