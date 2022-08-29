<script setup lang="ts">
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ModuleExecutionData } from '@/helpers/safe';
import { RealityModule } from '../realityModule';
import { useTxStatus, useWeb3 } from '@/composables';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
}>();

const { pendingCount } = useTxStatus();
const { web3Account } = useWeb3();

const executor = new RealityModule(props.executionData, props.proposalId);

watch(
  web3Account,
  async account => {
    if (account) {
      executor.setWriteProvider(getInstance().web3);
    } else {
      executor.setWriteProvider(undefined);
    }
  },
  { immediate: true }
);

const loading = ref(true);
onMounted(async () => {
  await executor.setQuestion();
  await executor.setProposalDetails();
  await executor.setModuleDetails();
  await executor.checkPossibleExecution();
  loading.value = false;
});

async function handleProposeTransactions() {
  const proposeTransaction = executor.proposeTransactions();
  await proposeTransaction.next();
  pendingCount.value++;
  await proposeTransaction.next();
  pendingCount.value--;

  await executor.setProposalDetails();
  await handleSetOracleAnswer('1');
}

async function handleSetOracleAnswer(answer: '0' | '1') {
  const setOralceAnswerTransaction = executor.setOracleAnswer(answer);
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
    {{ executor.finalizedAt }}
    <BaseButton v-if="executor.questionId" @click="handleSetOracleAnswer('0')">
      dispute transactions
    </BaseButton>
    <BaseButton v-else @click="handleProposeTransactions">
      propose transactions
    </BaseButton>
  </div>
</template>
