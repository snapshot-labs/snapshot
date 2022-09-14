<script setup lang="ts">
import { Transaction } from '@/helpers/transactionBuilder';

defineProps<{
  transaction: Transaction;
}>();
</script>

<template>
  <div>
    <div>To: {{ transaction.to }}</div>
    <div>Value: {{ transaction.value }}</div>
  </div>
</template>
