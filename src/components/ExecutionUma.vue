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

async function handleDisputeExecution() {
  const disputeTransaction = umaModule.disputeExecution();
  await disputeTransaction.next();
  pendingCount.value++;
  await disputeTransaction.next();
  pendingCount.value--;
}

async function handleExecute() {
  const executeTransaction = umaModule.execute();
  await executeTransaction.next();
  pendingCount.value++;
  await executeTransaction.next();
  pendingCount.value--;

  await umaModule.setState();
}
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
      <BaseButton @click="handleProposeExecution">
        propose transactions
      </BaseButton>
    </template>

    <template #dispute-execution>
      <!-- TODO: display txs/hashes as proposed on chain-->
      <BaseButton @click="handleDisputeExecution">
        Dispute transactions
      </BaseButton>
    </template>

    <template #execute>
      <BaseButton @click="handleExecute"> Execute transactions </BaseButton>
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
