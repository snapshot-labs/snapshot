<script setup lang="ts">
import { ExecutionData } from '@/helpers/safe';

defineProps<{
  executionData: ExecutionData;
}>();

// TODO: Figure out if normal/manual safe tx hash can be comoputed in advance
// to look up whether tthe transactions have been executed or not.
</script>

<template>
  <ExecutionTransactions :execution-data="executionData" />
  <div class="p-4 text-center">Transactions will be executed manually.</div>
</template>
