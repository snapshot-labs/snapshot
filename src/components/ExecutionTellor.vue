<script setup lang="ts">
import { onMounted } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useSafeTellorModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
  proposalStillActive: boolean;
}>();

const tellorModule = useSafeTellorModule(props.executionData, props.proposalId);

onMounted(tellorModule.setState);
</script>

<template>
  <ExecutionAbstract
    :executor-state="tellorModule.state"
    :execution-data="executionData"
    :proposal-still-active="proposalStillActive"
  >
    <template #proposal-still-active>
      <div class="p-4 text-center">
        Execution will be possible after the proposal has ended.
      </div>
    </template>

    <template #propose>
      <BaseButton @click="tellorModule.proposeExecution">
        propose transactions
      </BaseButton>
    </template>

    <template #dispute>
      <!-- TODO: display txs/hashes as proposed on chain-->
      <BaseButton @click="tellorModule.disputeExecution">
        Dispute transactions
      </BaseButton>
    </template>

    <template #execute>
      <BaseButton @click="tellorModule.execute">
        Execute transactions
      </BaseButton>
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

    <template #rejected>
      <div class="flex flex-col items-center justify-center p-4">
        <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
          <i-ho-x />
        </span>
        <span>Transactions have been rejected.</span>
      </div>
    </template>
  </ExecutionAbstract>
</template>
