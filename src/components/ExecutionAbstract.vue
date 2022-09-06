<script setup lang="ts">
import { ExecutionData, ExecutorState } from '@/helpers/safe';
import { useTxStatus } from '@/composables';

defineProps<{
  executorState: ExecutorState;
  executionData: ExecutionData;
  hasProposalEnded: boolean;
}>();

const { pendingCount } = useTxStatus();
</script>

<template>
  <div>
    <ExecutionTransactions :execution-data="executionData" />
    <div v-if="hasProposalEnded">
      <div v-if="executorState.loading || pendingCount" class="p-4 text-center">
        <LoadingSpinner />
      </div>
      <slot v-else-if="executorState.hasBeenRejected" name="rejected" />
      <slot
        v-else-if="executorState.hasBeenExecuted"
        name="has-been-executed"
      />
      <div v-else>
        <slot v-if="executorState.canBeExecuted" name="execute" />
        <div v-else>
          <slot v-if="executorState.hasBeenProposed" name="dispute-execution" />
          <slot v-else name="propose-execution" />
        </div>
      </div>
    </div>
    <slot v-else name="proposal-still-active" />
  </div>
</template>
