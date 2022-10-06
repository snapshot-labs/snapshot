<script setup lang="ts">
import { onMounted } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useSafeUmaModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
  hasProposalEnded: boolean;
}>();

const umaModule = useSafeUmaModule(props.executionData, props.proposalId);

onMounted(umaModule.setState);
</script>

<template>
  <ExecutionAbstract
    :executor-state="umaModule.state"
    :execution-data="executionData"
    :has-proposal-ended="hasProposalEnded"
  >
    <template #proposal-still-active>
      <div class="p-4 text-center">
        Execution will be possible after the proposal has ended.
      </div>
    </template>

    <template #propose-execution>
      <div
        v-if="umaModule.state.bondAllowance.gte(umaModule.state.bondAmount)"
        class="flex flex-col"
      >
        <BaseButton @click="umaModule.proposeExecution">
          propose transactions
        </BaseButton>
        <small class="mt-2 opacity-50"
          >You will deposit a bond of {{ umaModule.state.bondAmount }}.</small
        >
      </div>
      <div v-else>
        To propose these transactions you need to deposit a bond of
        {{ umaModule.state.bondAmount }}. This bond needs to be approved by you
        first.
        <BaseButton class="mt-3" @click="umaModule.approveBond">
          approve bond
        </BaseButton>
      </div>
    </template>

    <template #dispute-execution>
      <!-- TODO: display txs/hashes as proposed on chain-->
      <BaseButton @click="umaModule.disputeExecution">
        Dispute transactions
      </BaseButton>
    </template>

    <template #execute>
      <BaseButton @click="umaModule.execute"> Execute transactions </BaseButton>
    </template>

    <template #has-been-executed>
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
