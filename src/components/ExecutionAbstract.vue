<script setup lang="ts">
import { ExecutionData, ExecutorState } from '@/helpers/safe';

defineProps<{
  executorState: ExecutorState;
  executionData: ExecutionData;
  hasProposalEnded: boolean;
}>();
</script>

<template>
  <div>
    <ExecutionTransactions :execution-data="executionData" />
    <div v-if="hasProposalEnded">
      <div v-if="executorState.loading" class="p-4 text-center">
        <LoadingSpinner />
      </div>
      <div
        v-else-if="executorState.hasBeenExecuted"
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
      <div v-else>
        <slot v-if="executorState.canBeExecuted" name="execute" />
        <div v-else>
          <!-- display proposed txs/hashes-->
          <slot v-if="executorState.hasBeenProposed" name="dispute-execution" />
          <slot v-else name="propose-execution" />
        </div>
      </div>
    </div>
    <slot v-else name="proposal-still-active" />
  </div>
</template>
