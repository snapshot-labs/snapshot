<script setup lang="ts">
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import {
  Transaction as TTransaction,
  Network,
  TenderlySimulationResult,
  GnosisSafe,
  isErrorWithMessage
} from '../../types';
import { ref } from 'vue';
import {
  SIMULATION_ENDPOINT,
  exceedsOsnapGasSubsidy,
  prepareTenderlySimulationPayload,
  validatePayload,
  OSNAP_GAS_SUBSIDY
} from '../../utils/tenderly';

const props = defineProps<{
  transactions: TTransaction[];
  safe: GnosisSafe | null;
  network: Network;
}>();

type State =
  | {
      status: 'SUCCESS';
      simulationLink: TenderlySimulationResult['resultUrl'];
      gasUsed: TenderlySimulationResult['gasUsed'];
      exceedsGasSubsidy: boolean;
    }
  | {
      status: 'FAIL';
      simulationLink: TenderlySimulationResult['resultUrl'];
      gasUsed: TenderlySimulationResult['gasUsed'];
      exceedsGasSubsidy: boolean;
    }
  | {
      status: 'ERROR';
      error: string;
    }
  | {
      status: 'LOADING';
    }
  | {
      status: 'IDLE';
    };

const simulationState = ref<State>({ status: 'IDLE' });

const resetState = () => {
  simulationState.value = { status: 'IDLE' };
};

function handleSimulationResult(res: TenderlySimulationResult) {
  // if gas exceeds osnap gas subsidy, tx will not be automatically executed
  const exceedsGasSubsidy = exceedsOsnapGasSubsidy(res);

  if (res.status === true) {
    simulationState.value = {
      status: 'SUCCESS',
      simulationLink: res.resultUrl,
      gasUsed: res.gasUsed,
      exceedsGasSubsidy
    };
  } else {
    simulationState.value = {
      status: 'FAIL',
      simulationLink: res.resultUrl,
      gasUsed: res.gasUsed,
      exceedsGasSubsidy
    };
  }
}

async function simulate() {
  simulationState.value = { status: 'LOADING' };
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
      simulationState.value = { status: 'ERROR', error: error.message };
    } else {
      simulationState.value = {
        status: 'ERROR',
        error: 'Failed to simulate!'
      };
    }
    await sleep(5_000);
    simulationState.value = {
      status: 'IDLE'
    };
  }
}
</script>

<template>
  <div>
    <button
      v-if="
        !(
          simulationState.status === 'SUCCESS' ||
          simulationState.status === 'FAIL'
        )
      "
      @click="simulate"
      :disabled="simulationState.status !== 'IDLE'"
      :class="[
        'flex w-full enabled:hover:border-skin-text gap-2 justify-center h-[48px] px-[20px] items-center border disabled:cursor-not-allowed rounded-full border-skin-border',
        {
          'text-red': simulationState.status === 'ERROR'
        }
      ]"
    >
      <IconTenderly class="text-skin-link inline h-[20px] w-[20px]" />
      <span v-if="simulationState.status === 'IDLE'">Simulate Transaction</span>
      <span v-if="simulationState.status === 'LOADING'"
        >Checking transaction...</span
      >
      <span class="text-xs" v-if="simulationState.status === 'ERROR'">{{
        simulationState.error
      }}</span>

      <LoadingSpinner
        class="ml-auto"
        v-if="simulationState.status === 'LOADING'"
      />
    </button>
    <div class="flex flex-col gap-2" v-else>
      <div
        :class="[
          'flex w-full text-sm md:text-[18px] justify-between h-[48px] px-[20px] items-center rounded-full',
          {
            'bg-green/20 text-green': simulationState.status === 'SUCCESS',
            'bg-red/20 text-red': simulationState.status === 'FAIL'
          }
        ]"
      >
        <div class="flex items-center gap-2">
          <IconTenderly class="inline h-[20px] w-[20px] text-inherit" />
          <span v-if="simulationState.status === 'SUCCESS'">Success!</span>
          <span v-if="simulationState.status === 'FAIL'"
            >Transaction failed!</span
          >
        </div>
        <a
          v-if="simulationState.simulationLink.public"
          target="_blank"
          class="flex items-center gap-1 text-inherit hover:underline"
          :href="simulationState.simulationLink.url"
        >
          <span>View on Tenderly</span>
          <IHoExternalLink class="text-inherit inline w-[1.2em] h-[1.2em]" />
        </a>
        <div v-else class="text-inherit">Simulation not public</div>
      </div>

      <TuneButton
        class="group text-sm md:text-[18px] hover:cursor-pointer justify-center w-full flex gap-2 mx-auto items-center"
        :tooltip="'Reset Simulation'"
        @click="resetState"
      >
        Reset Simulation
        <IHoRefresh class="text-inherit w-[1em] h-[1em]" />
      </TuneButton>

      <p v-if="simulationState.exceedsGasSubsidy" class="text-sm text-left">
        <strong class="text-skins text-base text-red">Warning:</strong>
        This transaction will
        <strong class="underline"
          >not be automatically executed by oSnap.</strong
        >
        This transaction used
        {{ simulationState.gasUsed.toLocaleString() }} gas, which exceeds
        oSnap's maximum subsidized amount of
        {{ OSNAP_GAS_SUBSIDY.toLocaleString() }}.
      </p>
    </div>
  </div>
</template>
