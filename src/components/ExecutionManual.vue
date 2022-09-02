<script setup lang="ts">
import { ExecutionData } from '@/helpers/safe';

defineProps<{
  executionData: ExecutionData;
}>();
</script>

<template>
  <ExecutionTransactions :execution-data="executionData" />
  <div class="p-4 text-center">Transactions will be executed manually.</div>
</template>
