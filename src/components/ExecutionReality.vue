<script setup lang="ts">
import { onMounted } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus, useSafeRealityModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
  hasProposalEnded: boolean;
  proposalSnapshot: string;
}>();

const { pendingCount } = useTxStatus();

const realityModule = useSafeRealityModule(
  props.executionData,
  props.proposalId,
  props.proposalSnapshot
);

onMounted(realityModule.setState);

async function handleProposeExecution() {
  const proposeTransaction = realityModule.proposeExecution();
  await proposeTransaction.next();
  pendingCount.value++;
  await proposeTransaction.next();
  pendingCount.value--;

  await realityModule.setState();

  await handleDisputeExecution('1');
}

async function handleDisputeExecution(answer: '0' | '1') {
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

  await realityModule.setState();
}

async function handleExecute() {
  const executeTransaction = realityModule.execute();
  await executeTransaction.next();
  pendingCount.value++;
  await executeTransaction.next();
  pendingCount.value--;

  await realityModule.setState();
}

async function handleClaimBond() {
  const claimBondTransaction = realityModule.claimBond();
  await claimBondTransaction.next();
  pendingCount.value++;
  await claimBondTransaction.next();
  pendingCount.value--;

  await realityModule.setState();
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
      Has the proposal passed?
      <BaseButton @click="handleDisputeExecution('1')"> Yes </BaseButton>
      <BaseButton @click="handleDisputeExecution('0')"> No </BaseButton>
    </template>

    <template #execute>
      <div v-if="realityModule.state.canBeExecuted">
        <BaseButton @click="handleExecute">
          Execute transaction batch #{{ realityModule.state.nextTxIndex }}
        </BaseButton>
        <BaseButton @click="handleClaimBond"> Claim bond </BaseButton>
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
  </ExecutionAbstract>
</template>
