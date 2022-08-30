<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus, useSafeRealityModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
}>();

const { pendingCount } = useTxStatus();

const realityModule = useSafeRealityModule(
  props.executionData,
  props.proposalId
);

const loading = ref(true);
onMounted(async () => {
  await realityModule.setQuestion();
  await realityModule.setProposalDetails();
  await realityModule.setModuleDetails();
  await realityModule.checkPossibleExecution();
  loading.value = false;
});

async function handleProposeExecution() {
  const proposeTransaction = realityModule.proposeExecution();
  await proposeTransaction.next();
  pendingCount.value++;
  await proposeTransaction.next();
  pendingCount.value--;

  await realityModule.setProposalDetails();
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
  <div>
    <LoadingSpinner v-if="loading" />
    <div v-if="realityModule.questionId">
      <div v-if="realityModule.finalizedAt">
        <BaseButton v-if="realityModule.canExecute()"> execute </BaseButton>
        <div v-else>waiting for cooldown</div>
      </div>
      <div v-else>
        <BaseButton @click="handleSetOracleAnswer('0')">
          dispute transactions
        </BaseButton>
      </div>
    </div>
    <BaseButton v-else @click="handleProposeExecution">
      propose transactions
    </BaseButton>
  </div>
</template>
