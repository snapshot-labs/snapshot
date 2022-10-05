<script setup lang="ts">
import { ExecutionData, ExecutorState } from '@/helpers/safe';
import { useModal, useTxStatus, useWeb3 } from '@/composables';

defineProps<{
  executorState: ExecutorState;
  executionData: ExecutionData;
  hasProposalEnded: boolean;
}>();

const { modalAccountOpen } = useModal();
const { pendingCount } = useTxStatus();
const { web3Account } = useWeb3();
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
        <div v-if="web3Account">
          <slot v-if="executorState.canBeExecuted" name="execute" />
          <div v-else>
            <slot
              v-if="executorState.hasBeenProposed"
              name="dispute-execution"
            />
            <slot v-else name="propose-execution" />
          </div>
        </div>
        <div v-else>
          <div class="p-4 text-center">
            <BaseButton @click="modalAccountOpen = true"
              >connect wallet</BaseButton
            >
          </div>
        </div>
      </div>
    </div>
    <slot v-else name="proposal-still-active" />
  </div>
</template>
