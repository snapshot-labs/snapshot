<script setup lang="ts">
import { sanitizeUrl } from '@braintree/sanitize-url';
import {
  CustomConnextTransaction,
  SafeTransactionConfig,
  SimulationState
} from '@/helpers/interfaces';
import SimulationMessage from './Message.vue';

import { useSimulation } from '../../composable/useSimulation';

type SimulationTenderlyProps = {
  modelValueToSimulate: CustomConnextTransaction;
  config: SafeTransactionConfig;
  runSimulation: boolean;
  defaultSimulationResult?: SimulationState;
  isDetails?: boolean;
};

const props = defineProps<SimulationTenderlyProps>();
const emit = defineEmits(['close', 'update:simulation']);
const updateSimulationState = (state: SimulationState) => {
  emit('update:simulation', state);
};
const { simulate, loading, simulationState } = useSimulation(
  updateSimulationState,
  props.defaultSimulationResult
);

watch(
  () => props.runSimulation,
  run => {
    if (run) {
      simulate(props.modelValueToSimulate, props.config);
    }
  },
  { immediate: true }
);

const className = computed(() => {
  return props.isDetails && 'simulation-details-container';
});
</script>

<template>
  <div :class="className">
    <div v-if="loading" class="flex space-x-2">
      <LoadingSpinner class="pb-[3px]" />
      <p class="text-[12px">Running simulation</p>
    </div>

    <SimulationMessage
      v-if="!loading && simulationState.status === 'error'"
      type="error"
      message="Transaction simulation failed"
      :is-details="isDetails"
      @close="emit('close')"
    />
    <SimulationMessage
      v-if="!loading && simulationState.status === 'success'"
      type="success"
      message="Transaction simulation successful"
      :is-details="isDetails"
      @close="emit('close')"
    />
    <div v-if="!loading">
      <div
        v-for="(event, index) in simulationState.logs"
        :key="index"
        class="my-1 text-xs"
      >
        <p>
          <span class="mr-2 text-[12px]">○</span>{{ event.type }}:
          <BaseLink :link="sanitizeUrl(event.url)">
            <span :class="'whitespace-normal'">
              {{ event.message }}
            </span>
          </BaseLink>
        </p>
      </div>
      <p class="text-[12px]">
        Transaction simulation powered by
        <a href="https://tenderly.co/" target="_blank" class="underline"
          >Tenderly</a
        >
      </p>
    </div>
  </div>
</template>

<style lang="scss">
.simulation-details-container {
  border-radius: 8px;
  border: 1px solid #5f5f5f;
  padding: 16px;
  margin-bottom: 16px;
}
</style>
