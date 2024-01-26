<script setup lang="ts">
import { Transaction as TTransaction, Network } from '../../types';
import { computed } from 'vue';
import { ref } from 'vue';

const props = defineProps<{
  transactions: TTransaction[]; // simulate bundle https://docs.tenderly.co/web3-gateway/references/simulate-bundle-json-rpc
  safeAddress: string;
  moduleAddress: string;
  network: Network;
}>();

// ERROR => unable to simulate
// FAIL => tx failed in simulation
// SUCCESS =>  tx Succeeded in simulation
type Status = 'SUCCESS' | 'FAIL' | 'ERROR' | 'LOADING' | 'IDLE';
const simulationState = ref<Status>('IDLE');
const simulationLink = ref<string>();

// TODO: get interface/url when serverless func is implemented
type SimulationResponse = {
  data?: unknown;
  error?: unknown;
};

// TODO: get endpoint
const simulationEndpoint = 'https://jsonplaceholder.typicode.com/posts';
// TODO: remove sleep logic this is just for testing the UI
const sleep = async (ms: number) => new Promise(res => setTimeout(res, ms));

async function simulate() {
  simulationState.value = 'LOADING';
  try {
    const response = await fetch(simulationEndpoint, {
      method: 'POST',
      // TODO: edit payload where necessary
      body: JSON.stringify(props)
    });

    const data: SimulationResponse = await response.json();
    // TODO: parse Success response

    // check if tx passed in simulation
    simulationState.value = 'ERROR';
    // simulationState.value = 'FAIL';

    // set tender simulation link
    simulationLink.value =
      'https://docs.tenderly.co/web3-gateway/references/simulate-json-rpc';
  } catch (error) {
    // network error
    simulationState.value = 'ERROR';
    return { error };
    // TODO: remove sleep logic this is just for testing the UI
  } finally {
    await sleep(2000);
    simulationState.value = 'IDLE';
  }
}

const showResult = computed(() => {
  return (
    simulationState.value === 'FAIL' || simulationState.value === 'SUCCESS'
  );
});

// IDLE => run simulation
// FAIL || SUCCESS => re-run
// FAIL => show info on failure
// LOADING => hide simulate button, show spinner
</script>

<template>
  <div>
    <button
      v-if="!showResult"
      @click="simulate"
      :disabled="simulationState !== 'IDLE'"
      class="flex w-full enabled:hover:border-skin-text gap-2 justify-center h-[48px] px-[20px] items-center border disabled:cursor-not-allowed rounded-full border-skin-border"
    >
      <IconTenderly class="text-skin-link inline h-[20px] w-[20px]" />
      <span v-if="simulationState === 'IDLE'">Simulate Transaction</span>
      <span v-if="simulationState === 'LOADING'">Checking transaction...</span>
      <span v-if="simulationState === 'ERROR'">Failed to simulate!</span>

      <LoadingSpinner class="ml-auto" v-if="simulationState === 'LOADING'" />
    </button>
    <div
      v-if="showResult"
      :class="[
        'flex w-full gap-2 justify-between h-[48px] px-[20px] items-center rounded-full',
        {
          'bg-green/20 border-green text-green': simulationState === 'SUCCESS',
          'bg-red/20 border-red text-red': simulationState === 'FAIL'
        }
      ]"
    >
      <IconTenderly class="inline h-[20px] w-[20px] text-inherit" />
      <span v-if="simulationState === 'SUCCESS'">Transaction passed!</span>
      <span v-if="simulationState === 'FAIL'">Transaction failed!</span>
      <a
        target="_blank"
        class="flex py-2 pl-2 items-center gap-1 ml-auto text-inherit hover:underline"
        :href="simulationLink"
        >View on Tenderly
        <IHoExternalLink class="text-inherit inline w-[1em] h-[1em]"
      /></a>
    </div>
  </div>
</template>
