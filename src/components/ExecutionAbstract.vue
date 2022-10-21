<script setup lang="ts">
import { computed } from 'vue';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { ExecutionState } from '@/helpers/safe';
import { useModal, useWeb3 } from '@/composables';

const props = defineProps<{
  loading: boolean;
  executionState: ExecutionState;
  network: string;
}>();

const { modalAccountOpen } = useModal();
const { web3Account, web3 } = useWeb3();

const requiredNetwork = networks[props.network];
const isWrongNetwork = computed(
  () => web3.value.network.chainId !== requiredNetwork.chainId
);
</script>

<template>
  <div>
    <template v-if="executionState === ExecutionState.WAITING">
      Execution will be possible after the proposal has ended.
    </template>
    <LoadingSpinner v-else-if="loading" />
    <slot
      v-else-if="executionState === ExecutionState.INVALIDATED"
      name="invalidated"
    />
    <slot
      v-else-if="executionState === ExecutionState.REJECTED"
      name="rejected"
    />
    <slot
      v-else-if="executionState === ExecutionState.EXECUTED"
      name="executed"
    />
    <BaseButton v-else-if="!web3Account" @click="modalAccountOpen = true">
      connect wallet
    </BaseButton>
    <template v-else-if="isWrongNetwork">
      You are connected to the wrong network.<br />Please connect to:
      {{ requiredNetwork.name }} ({{ requiredNetwork.chainId }}).
    </template>
    <slot
      v-else-if="executionState === ExecutionState.EXECUTABLE"
      name="execute"
    />
    <slot
      v-else-if="executionState === ExecutionState.DISPUTABLE"
      name="dispute"
    />
    <slot
      v-else-if="executionState === ExecutionState.PROPOSABLE"
      name="propose"
    />
  </div>
</template>
