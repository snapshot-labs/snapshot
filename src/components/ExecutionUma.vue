<script setup lang="ts">
import { onMounted } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus, useSafeUmaModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
  hasProposalEnded: boolean;
}>();

const umaModule = useSafeUmaModule(props.executionData, props.proposalId);
const { pendingCount } = useTxStatus();

onMounted(umaModule.setState);

async function handleProposeExecution() {
  const proposeTransaction = umaModule.proposeExecution();
  await proposeTransaction.next();
  pendingCount.value++;
  await proposeTransaction.next();
  pendingCount.value--;
}
</script>

<template>
  <div>
    <ExecutionTransactions :execution-data="executionData" />
    <div v-if="hasProposalEnded">
      <LoadingSpinner v-if="umaModule.state.loading" />
      <BaseButton v-else @click="handleProposeExecution">
        propose transactions
      </BaseButton>
    </div>
    <div v-else>Execution will be possible after the proposal has ended.</div>
  </div>
</template>
