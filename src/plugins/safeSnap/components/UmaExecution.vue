<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus, useSafeUmaModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
}>();

const umaModule = useSafeUmaModule(props.executionData, props.proposalId);
const { pendingCount } = useTxStatus();

const loading = ref(true);
onMounted(async () => {
  loading.value = false;
});

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
    <LoadingSpinner v-if="loading" />
    <BaseButton v-else @click="handleProposeExecution">
      propose transactions
    </BaseButton>
  </div>
</template>
