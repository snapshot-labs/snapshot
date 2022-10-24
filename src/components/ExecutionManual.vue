<script setup lang="ts">
import { ExecutionData } from '@/helpers/safe';
import { useWeb3 } from '@/composables';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { convertExecutionDataToModuleTransactions } from '@/helpers/transactionBuilder';

const props = defineProps<{
  executionData: ExecutionData;
}>();

const { web3Account } = useWeb3();

async function execute() {
  const safe = getInstance().web3.getSigner();
  const transactions = convertExecutionDataToModuleTransactions(
    props.executionData
  );
  for (const { to, value, data } of transactions) {
    await safe.sendTransaction({ to, value, data });
  }
}
</script>

<template>
  <div>
    <div class="p-4 text-center">
      <div v-if="web3Account === executionData.safe.address">
        <BaseButton @click="execute"> Execute transactions </BaseButton>
      </div>
      <div v-else>Transactions can be executed manually in the safe.</div>
    </div>
  </div>
</template>
