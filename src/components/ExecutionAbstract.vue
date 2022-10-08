<script setup lang="ts">
import { computed } from 'vue';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { ExecutionData, ExecutorState } from '@/helpers/safe';
import { useModal, useWeb3 } from '@/composables';

const props = defineProps<{
  executorState: ExecutorState;
  executionData: ExecutionData;
  proposalStillActive: boolean;
}>();

const { modalAccountOpen } = useModal();
const { web3Account, web3 } = useWeb3();

const requiredNetwork = networks[props.executionData.safe.network];
const isWrongNetwork = computed(
  () => web3.value.network.chainId !== requiredNetwork.chainId
);
</script>

<template>
  <div>
    <ExecutionTransactions :execution-data="executionData" />
    <div class="p-4 text-center">
      <template v-if="proposalStillActive">
        Execution will be possible after the proposal has ended.
      </template>
      <LoadingSpinner v-else-if="executorState.loading" />
      <slot v-else-if="executorState.hasBeenRejected" name="rejected" />
      <slot v-else-if="executorState.hasBeenExecuted" name="executed" />
      <BaseButton v-else-if="!web3Account" @click="modalAccountOpen = true">
        connect wallet
      </BaseButton>
      <template v-else-if="isWrongNetwork">
        You are connected to the wrong network.<br />Please connect to:
        {{ requiredNetwork.name }} ({{ requiredNetwork.chainId }}).
      </template>
      <slot v-else-if="executorState.canBeExecuted" name="execute" />
      <slot v-else-if="executorState.hasBeenProposed" name="dispute" />
      <slot v-else name="propose" />
    </div>
  </div>
</template>
