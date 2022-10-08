<script setup lang="ts">
import { ExecutionData, ExecutorState } from '@/helpers/safe';
import { reactive } from 'vue';

const props = defineProps<{
  executionData: ExecutionData;
  proposalStillActive: boolean;
}>();

// TODO: Figure out if normal/manual safe tx hash can be comoputed in advance
// to look up whether tthe transactions have been executed or not.
const state = reactive<ExecutorState>({
  loading: false,
  canBeExecuted: props.hasProposalEnded,
  hasBeenExecuted: false,
  hasBeenProposed: true
});
</script>

<template>
  <ExecutionAbstract
    :executor-state="state"
    :execution-data="executionData"
    :proposal-still-active="proposalStillActive"
  >
    <template #proposal-still-active>
      <div class="p-4 text-center">
        Execution will be possible after the proposal has ended.
      </div>
    </template>

    <template #execute>
      <div class="p-4 text-center">
        Transactions will be executed manually in the safe.
      </div>
    </template>

    <template #executed>
      <div class="flex flex-col items-center justify-center p-4">
        <span class="mb-3 rounded-full bg-green p-2 text-white">
          <i-ho-check />
        </span>
        <span>Transactions have been executed.</span>
        <BaseLink link="https://etherscan.io">
          Open transaction in explorer
        </BaseLink>
      </div>
    </template>
  </ExecutionAbstract>
</template>
