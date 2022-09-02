<script setup lang="ts">
import { onMounted } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus, useSafeRealityModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
  hasProposalEnded: boolean;
}>();

const { pendingCount } = useTxStatus();

const realityModule = useSafeRealityModule(
  props.executionData,
  props.proposalId
);

onMounted(realityModule.setState);

async function handleProposeExecution() {
  const proposeTransaction = realityModule.proposeExecution();
  await proposeTransaction.next();
  pendingCount.value++;
  await proposeTransaction.next();
  pendingCount.value--;

  await realityModule.setState();
  await handleSetOracleAnswer('1');
}

async function handleSetOracleAnswer(answer: '0' | '1') {
  const setOralceAnswerTransaction = realityModule.setOracleAnswer(answer);
  const step = await setOralceAnswerTransaction.next();
  if (step.value === 'erc20-approval') {
    pendingCount.value++;
    await setOralceAnswerTransaction.next();
    pendingCount.value--;
    await setOralceAnswerTransaction.next();
  }
  pendingCount.value++;
  await setOralceAnswerTransaction.next();
  pendingCount.value--;
}
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
        <BaseButton class="w-full" @click="handleProposeExecution">
          Propose transactions for execution
        </BaseButton>
      </div>
    </template>

    <template #dispute-execution>
      <!-- TODO: display txs/hashes as proposed on chain-->
      <div v-if="realityModule.state.questionId">
        <div v-if="realityModule.state.finalizedAt">
          <BaseButton v-if="realityModule.canExecute()"> execute </BaseButton>
          <div v-else>waiting for cooldown</div>
        </div>
        <div v-else>
          <BaseButton @click="handleSetOracleAnswer('0')">
            dispute transactions
          </BaseButton>
        </div>
      </div>
    </template>

    <template #execute>
      <BaseButton>Execute transactions</BaseButton>
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
  </ExecutionAbstract>
</template>
