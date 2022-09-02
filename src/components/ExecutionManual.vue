<script setup lang="ts">
import { ExecutionData } from '@/helpers/safe';

defineProps<{
  executionData: ExecutionData;
}>();

// TODO: Figure out if normal/manual safe tx hash can be comoputed in advance
// to look up whether tthe transactions have been executed or not.
const hasBeenExecuted = true;
</script>

<template>
  <ExecutionTransactions :execution-data="executionData" />
  <div
    v-if="hasBeenExecuted"
    class="flex flex-col items-center justify-center p-4"
  >
    <span class="mb-3 rounded-full bg-green p-2 text-white">
      <i-ho-check />
    </span>
    <span>Transactions have been executed.</span>
    <BaseLink link="https://etherscan.io">
      Open transaction in explorer
    </BaseLink>
  </div>
</template>
