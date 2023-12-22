<script setup lang="ts">
import { Transaction as TTransaction, Network } from '../../types';
import { ref } from 'vue';

const props = defineProps<{
  transactions: TTransaction[]; // simulate bundle https://docs.tenderly.co/web3-gateway/references/simulate-bundle-json-rpc
  safeAddress: string;
  moduleAddress: string;
  network: Network;
}>();

// button state
type Status = 'SUCCESS' | 'FAIL' | 'LOADING' | 'IDLE';
const simulationState = ref<Status>('IDLE');

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
    // handle outcome, set state for button
    simulationState.value = 'SUCCESS';
    // TODO: parse Success response
    return { data };
  } catch (error) {
    // TODO: parse FAIL response
    simulationState.value = 'FAIL';
    return { error };
    // TODO: remove sleep logic this is just for testing the UI
  } finally {
    await sleep(2000);
    simulationState.value = 'IDLE';
  }
}

// IDLE => run simulation
// FAIL || SUCCESS => re-run
// FAIL => show info on failure
// LOADING => hide simulate button, show spinner
</script>

<template>
  <div
    class="flex justify-between items-center border rounded-xl mt-4 px-3 py-2 border-skin-border"
  >
    <div class="flex flex-col items-start justify-center gap-1">
      <p class="text-skin-link">Simulate these transactions</p>
      <p class="text-sm opacity-50">
        Powered by <IconTenderly class="text-skin-link inline h-[1em]" />
      </p>
    </div>

    <button
      :class="[
        'group border border-skin-primary p-1 rounded-lg min-w-[100px] text-skin-link',
        simulationState === 'LOADING' ? 'opacity-60' : 'opacity-100'
      ]"
      @click="simulate"
      :disabled="simulationState === 'LOADING'"
    >
      <LoadingSpinner v-if="simulationState === 'LOADING'" />
      <span v-if="simulationState === 'IDLE'">Simulate</span>
      <span v-if="simulationState === 'SUCCESS'">Success</span>
      <span v-if="simulationState === 'FAIL'">Fail</span>
    </button>
  </div>
</template>
