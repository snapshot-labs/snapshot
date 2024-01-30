<script setup lang="ts">
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import {
  Transaction as TTransaction,
  Network,
  TenderlySimulationResult,
  GnosisSafe,
  isErrorWithMessage
} from '../../types';
import { computed } from 'vue';
import { ref } from 'vue';
import {
  SIMULATION_ENDPOINT,
  prepareTenderlySimulationPayload,
  validatePayload
} from '../../utils/tenderly';

// ERROR => unable to simulate
// FAIL => tx Failed in simulation
// SUCCESS =>  tx Succeeded in simulation
type Status = 'SUCCESS' | 'FAIL' | 'ERROR' | 'LOADING' | 'IDLE';

const props = defineProps<{
  transactions: TTransaction[];
  safe: GnosisSafe | null;
  network: Network;
}>();

const simulationState = ref<Status>('IDLE');
const simulationLink = ref<string>();
const simulationError = ref<string>();

function handleSimulationResult(res: TenderlySimulationResult) {
  if (res.status === true) {
    simulationState.value = 'SUCCESS';
  } else {
    simulationState.value = 'FAIL';
  }
  simulationLink.value = res.resultUrl.url;
}

async function simulate() {
  simulationState.value = 'LOADING';
  try {
    const payload = prepareTenderlySimulationPayload(props);

    // throws if invalid
    validatePayload(payload);

    const response = await fetch(SIMULATION_ENDPOINT, {
      headers: new Headers({
        'content-type': 'application/json'
      }),
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Error running simulation');
    }

    const data: TenderlySimulationResult = await response.json();
    handleSimulationResult(data);
  } catch (error) {
    console.error(error);
    if (isErrorWithMessage(error)) {
      simulationError.value = error.message;
    }
    simulationState.value = 'ERROR';
    await sleep(5_000);
    simulationState.value = 'IDLE';
  }
}

const errorMessage = simulationError ?? 'Failed to simulate!';

const showResult = computed(() => {
  return (
    simulationState.value === 'FAIL' || simulationState.value === 'SUCCESS'
  );
});

const resetState = () => {
  simulationState.value = 'IDLE';
  simulationLink.value = undefined;
  simulationError.value = undefined;
};
</script>

<template>
  <div>
    <button
      v-if="!showResult"
      @click="simulate"
      :disabled="simulationState !== 'IDLE'"
      :class="[
        'flex w-full enabled:hover:border-skin-text gap-2 justify-center h-[48px] px-[20px] items-center border disabled:cursor-not-allowed rounded-full border-skin-border',
        {
          'text-red': simulationState === 'ERROR'
        }
      ]"
    >
      <IconTenderly class="text-skin-link inline h-[20px] w-[20px]" />
      <span v-if="simulationState === 'IDLE'">Simulate Transaction</span>
      <span v-if="simulationState === 'LOADING'">Checking transaction...</span>
      <span class="text-xs" v-if="simulationState === 'ERROR'">{{
        errorMessage
      }}</span>

      <LoadingSpinner class="ml-auto" v-if="simulationState === 'LOADING'" />
    </button>
    <div class="flex flex-col gap-2" v-if="showResult">
      <div
        :class="[
          'flex w-full text-sm md:text-[18px] justify-between h-[48px] px-[20px] items-center rounded-full',
          {
            'bg-green/20 text-green': simulationState === 'SUCCESS',
            'bg-red/20 text-red': simulationState === 'FAIL'
          }
        ]"
      >
        <div class="flex items-center gap-2">
          <IconTenderly class="inline h-[20px] w-[20px] text-inherit" />
          <span v-if="simulationState === 'SUCCESS'">Success!</span>
          <span v-if="simulationState === 'FAIL'">Transaction failed!</span>
        </div>
        <a
          target="_blank"
          class="flex items-center gap-1 text-inherit hover:underline"
          :href="simulationLink"
        >
          <span>View on Tenderly</span>
          <IHoExternalLink class="text-inherit inline w-[1.2em] h-[1.2em]"
        /></a>
      </div>
      <TuneButton
        class="group text-sm md:text-[18px] hover:cursor-pointer justify-center w-full flex gap-2 mx-auto items-center"
        :tooltip="'Reset Simulation'"
        v-if="showResult"
        @click="resetState"
      >
        Reset
        <IHoRefresh class="text-inherit w-[1em] h-[1em]" />
      </TuneButton>
    </div>
  </div>
</template>
