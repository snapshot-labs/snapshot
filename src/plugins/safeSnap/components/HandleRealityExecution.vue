<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTimestamp } from '@vueuse/core';
import { ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus, useSafeRealityModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
}>();

const { pendingCount } = useTxStatus();
const timestamp = useTimestamp();

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

async function handleProposeTransactions() {
  const proposeTransaction = realityModule.proposeTransactions();
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

const canBeExecuted = computed(() => {
  if (realityModule.finalizedAt.value && realityModule.cooldown.value) {
    return (
      realityModule.finalizedAt.value + realityModule.cooldown.value <
      timestamp.value
    );
  }
  return false;
});
</script>

<template>
  <div>
    <LoadingSpinner v-if="loading" />
    <div v-if="realityModule.questionId">
      <div v-if="realityModule.finalizedAt">
        <BaseButton v-if="canBeExecuted"> execute </BaseButton>
        <div v-else>waiting for cooldown</div>
      </div>
      <div v-else>
        <BaseButton @click="handleSetOracleAnswer('0')">
          dispute transactions
        </BaseButton>
      </div>
    </div>
    <BaseButton v-else @click="handleProposeTransactions">
      propose transactions
    </BaseButton>
  </div>
</template>
