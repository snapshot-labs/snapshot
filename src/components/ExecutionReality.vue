<script setup lang="ts">
import { onMounted } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useSafeRealityModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
  hasProposalEnded: boolean;
  proposalSnapshot: string;
}>();

const realityModule = useSafeRealityModule(
  props.executionData,
  props.proposalId,
  props.proposalSnapshot
);

onMounted(realityModule.setState);
</script>

<template>
  <ExecutionAbstract
    :executor-state="realityModule.state"
    :execution-data="executionData"
    :has-proposal-ended="hasProposalEnded"
  >
    <template #proposal-still-active>
      <div class="p-4 text-center">
        Execution will be possible after the proposal has ended.
      </div>
    </template>

    <template #propose-execution>
      <div class="p-4">
        <BaseButton class="w-full" @click="realityModule.proposeExecution">
          Propose transactions for execution
        </BaseButton>
      </div>
    </template>

    <template #dispute-execution>
      <!-- TODO: display txs/hashes as proposed on chain-->
      <div class="space-y-2 p-4 text-center">
        <div>Shall these transactions be executed?</div>
        <div>
          Current answer:
          {{ realityModule.state.questionResult ? 'Yes' : 'No' }}
        </div>
        <div>Cooldown: {{ realityModule.state.cooldown }}</div>
        <BaseButton
          v-if="!realityModule.state.questionResult"
          @click="realityModule.disputeExecution('1')"
        >
          Yes
        </BaseButton>
        <BaseButton
          v-if="realityModule.state.questionResult"
          @click="realityModule.disputeExecution('0')"
        >
          No
        </BaseButton>
        <div>Minimum bond: {{ realityModule.state.minimumBond }}</div>
      </div>
    </template>

    <template #execute>
      <div v-if="realityModule.state.canBeExecuted">
        <BaseButton @click="realityModule.execute">
          Execute transaction batch #{{ realityModule.state.nextTxIndex }}
        </BaseButton>
        <BaseButton @click="realityModule.claimBond"> Claim bond </BaseButton>
      </div>
      <div v-else>waiting for cooldown</div>
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
