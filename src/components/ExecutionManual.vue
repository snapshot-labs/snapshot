<script setup lang="ts">
import { ExecutionData } from '@/helpers/safe';

defineProps<{
  executionData: ExecutionData;
}>();

// TODO: Check if logged in as safe and allow to execute transactions.
</script>

<template>
  <div>
    <div class="p-4 text-center">
      Transactions can be executed manually in the safe.
    </div>
  </div>
</template>
