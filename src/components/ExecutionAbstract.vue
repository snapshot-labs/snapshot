<script setup lang="ts">
import { ExecutionData, ExecutorState } from '@/helpers/safe';
import { useModal, useTxStatus, useWeb3 } from '@/composables';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

const props = defineProps<{
  executorState: ExecutorState;
  executionData: ExecutionData;
  hasProposalEnded: boolean;
}>();

const { modalAccountOpen } = useModal();
const { pendingCount } = useTxStatus();
const { web3Account, web3 } = useWeb3();

const requiredNetwork = networks[props.executionData.safe.network];
</script>

<template>
  <div>
    <ExecutionTransactions :execution-data="executionData" />
    <div class="p-4 text-center">
      <template v-if="hasProposalEnded">
        <div v-if="executorState.loading || pendingCount">
          <LoadingSpinner />
        </div>
        <slot v-else-if="executorState.hasBeenRejected" name="rejected" />
        <slot
          v-else-if="executorState.hasBeenExecuted"
          name="has-been-executed"
        />
        <template v-else>
          <template v-if="web3Account">
            <template v-if="web3.network.chainId !== requiredNetwork.chainId">
              You are connected to the wrong network.<br />Please connect to:
              {{ requiredNetwork.name }} ({{ requiredNetwork.chainId }}).
            </template>
            <template v-else>
              <slot v-if="executorState.canBeExecuted" name="execute" />
              <template v-else>
                <slot
                  v-if="executorState.hasBeenProposed"
                  name="dispute-execution"
                />
                <slot v-else name="propose-execution" />
              </template>
            </template>
          </template>
          <div v-else class="p-4 text-center">
            <BaseButton @click="modalAccountOpen = true"
              >connect wallet</BaseButton
            >
          </div>
        </template>
      </template>
      <slot v-else name="proposal-still-active" />
    </div>
  </div>
</template>
