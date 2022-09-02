<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import {
  isTokenTransaction,
  isCollectableTransaction,
  isRawTransaction
} from '@/helpers/transactionBuilder';
import { ExecutionData } from '@/helpers/safe';

defineProps<{
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
    <div
      v-for="(transaction, transactionIndex) in batch"
      :key="transactionIndex"
      class="border-b px-3 py-2"
    >
      <div v-if="isRawTransaction(transaction)" class="flex items-center">
        <div class="transaction-type-label">
          <i-ho-adjustments />
          Standard
        </div>
        <div>
          <div>To: {{ transaction.to }}</div>
          <div>Value: {{ BigNumber.from(transaction.value).toString() }}</div>
          <div v-if="transaction.data">Data: {{ transaction.data }}</div>
        </div>
      </div>
      <div v-if="isTokenTransaction(transaction)" class="flex items-center">
        <div class="transaction-type-label">
          <i-ho-database />
          Send Tokens
        </div>
        <div>
          <div>To: {{ transaction.recipient }}</div>
          <div>Token: {{ transaction.tokenAddress }}</div>
          <div>Amount: {{ BigNumber.from(transaction.amount).toString() }}</div>
        </div>
      </div>
      <div
        v-if="isCollectableTransaction(transaction)"
        class="flex items-center"
      >
        <div class="transaction-type-label">
          <i-ho-photograph />
          Transfer NFT
        </div>
        <div>
          <div>To: {{ transaction.recipient }}</div>
          <div>Collectable: {{ transaction.collectableAddress }}</div>
          <div>ID: {{ transaction.collectableId }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-type-label {
  @apply flex w-1/4 flex-col items-center justify-center;
}
</style>
