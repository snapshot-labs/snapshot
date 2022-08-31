<script setup lang="ts">
import { RawTransaction } from '@/helpers/transactionBuilder';

defineProps<{
  transaction: RawTransaction;
}>();
</script>

<template>
  <div>
    <div>To: {{ transaction.to }}</div>
    <div>Value: {{ transaction.value }}</div>
    <div>Data: {{ transaction.data }}</div>
  </div>
</template>
