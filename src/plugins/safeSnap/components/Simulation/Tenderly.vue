<script setup lang="ts">
type SimulationTenderlyProps = {
  modelValueToSimulate: SafeTransaction[];
  config: SafeTransactionConfig;
  runSimulation: boolean;
  defaultSimulationResult?: SimulationState;
};

type TenderlySimulation = {
  id: string;
  status: boolean;
  method: string;
};

type TenderlyResultLogs = {
  name: string;
  inputs: {
    soltype: {
      name: string;
      type: string;
    };
    value: string;
  }[];
};

type TenderlyResultTransaction = {
  hash: string;
  from: string;
  input: string;
  nonce: number;
  to: string;
  status: boolean;
  error_message: string;
  transaction_info: {
    contract_address: string;
    method: string;
    call_trace: {
      contract_name: string;
      function_name: string;
      address: string;
      from: string;
      to: string;
      input: string;
      logs: TenderlyResultLogs[];
    };
    logs: TenderlyResultLogs[];
  };
};

type TenderlySimulationResult = {
  simulation_results: {
    transaction: TenderlyResultTransaction;
    simulation: TenderlySimulation;
  }[];
};

type SimulationLog = {
  type: string;
  message: string;
  url?: string;
};

export type SimulationState = {
  status: 'success' | 'error' | 'idle';
  logs: SimulationLog[];
};

import { Network } from '../../types';
import { shorten } from '../../../../helpers/utils';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { formatUnits } from '@ethersproject/units';
import {
  SafeTransaction,
  SafeTransactionConfig
} from '../../../../helpers/interfaces';
import SimulationMessage from './Message.vue';
import { ref } from 'vue';

const props = defineProps<SimulationTenderlyProps>();
const emit = defineEmits(['close', 'update:simulation']);
const loading = ref<boolean>(false);

const simulationState = ref<SimulationState>(
  props.defaultSimulationResult ?? {
    status: 'idle',
    logs: []
  }
);

const generateSimulationUrl = (id: string): string => {
  return `https://dashboard.tenderly.co/juliopavilaa/safesnap-plugin/simulator/${id}`;
};

const generateTransactionBody = (
  transactions: SafeTransaction[],
  network: Network
) => {
  return transactions.map(tx => {
    return {
      network_id: network,
      from: props.config.gnosisSafeAddress,
      to: tx.to,
      input: tx.data,
      value: '0',
      save: true,
      save_if_fails: true,
      gas: 30000000,
      gas_price: 0
    };
  });
};

const extractTransactionResult = (
  simulationResult: TenderlySimulationResult
) => {
  let events: SimulationLog[] = [];
  simulationResult.simulation_results.forEach(result => {
    const transaction = result.transaction;
    const simulationId = result.simulation.id;
    const addEvent = (type: string, message: string, simulationId: string) => {
      events.push({
        type,
        message,
        url: generateSimulationUrl(simulationId)
      });
    };
    if (transaction.status) {
      simulationState.value.status = 'success';
      const logs = transaction.transaction_info.logs;
      logs.forEach(log => {
        if (log.name === 'Transfer') {
          const from = log.inputs.find(
            input => input.soltype.name === 'from'
          )?.value;
          const to = log.inputs.find(
            input => input.soltype.name === 'to'
          )?.value;
          const value = log.inputs.find(
            input => input.soltype.name === 'value'
          )?.value;
          addEvent(
            'Transfer',
            `from ${shorten(from as string)} to ${shorten(
              to as string
            )} value ${formatUnits(value ?? '0').toString()}`,
            simulationId
          );
        }
      });

      logs.forEach(log => {
        if (log.name === 'Approval') {
          const owner = log.inputs.find(
            input => input.soltype.name === 'owner'
          )?.value;
          const spender = log.inputs.find(
            input => input.soltype.name === 'spender'
          )?.value;
          addEvent(
            'Approval',
            `owner ${shorten(owner as string)} spender ${shorten(
              spender as string
            )}`,
            simulationId
          );
        }
      });

      logs.forEach(log => {
        if (log.name === 'XCalled') {
          const transferId = log.inputs.find(
            input => input.soltype.name === 'transferId'
          )?.value;
          const asset = log.inputs.find(
            input => input.soltype.name === 'asset'
          )?.value;
          const amount = log.inputs.find(
            input => input.soltype.name === 'amount'
          )?.value;

          addEvent(
            'xcall',
            `transferId ${shorten(transferId as string)}, asset ${shorten(
              asset as string
            )} amount ${formatUnits(amount ?? '0').toString()}`,
            simulationId
          );
        }
      });
    }
    if (!transaction.status) {
      simulationState.value.status = 'error';
      addEvent(
        `The transaction failed during the simulation throwing error ${transaction.error_message}. Full simulation report is available on`,
        'Tenderly.',
        simulationId
      );
    }
  });
  simulationState.value.logs = events;
};

console.log('defaultSimulationResult', props.defaultSimulationResult)

const simulateTransaction = async (
  transactions: SafeTransaction[]
): Promise<TenderlySimulationResult> => {
  console.log('transactions', transactions);
  const apiURL = `https://api.tenderly.co/api/v1/account/juliopavilaa/project/safesnap-plugin/simulate-bundle`;
  const body = {
    simulations: generateTransactionBody(transactions, props.config.network)
  };
  console.log('body', body);
  const response = await fetch(apiURL, {
    method: 'POST',
    headers: {
      'content-type': 'application/JSON',
      'X-Access-Key': 'Y1B5Idizb07wrYwKD7fQP01Yk25ZJXLX'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const { error } = await response.json();
    simulationState.value = {
      status: 'error',
      logs: [{ type: error.slug, message: error.message }]
    };

    throw new Error(`Failed to simulate transaction: ${response.statusText}`);
  }

  return await response.json();
};

const simulate = async () => {
  console.log('props.modelValueToSimulate', props.modelValueToSimulate);
  loading.value = true;

  try {
    if (props.modelValueToSimulate && props.modelValueToSimulate.length) {
      const transactions = props.modelValueToSimulate;
      const tenderlySimulation = await simulateTransaction(transactions);
      extractTransactionResult(tenderlySimulation);
    }
  } catch (error) {
    console.error('Error during simulation:', error);
    simulationState.value = {
      status: 'error',
      logs: [{ type: 'error', message: 'An error occurred during simulation.' }]
    };
  } finally {
    loading.value = false;
    emit('update:simulation', simulationState);
  }
};

watch(
  () => props.runSimulation,
  run => {
    if (run) {
      simulate();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    {{ console.log('simulationState', simulationState) }}
    <div v-if="loading" class="flex space-x-2">
      <LoadingSpinner class="pb-[3px]" />
      <p class="text-[12px] text-white">Running simulation</p>
    </div>
    <SimulationMessage
      v-if="!loading && simulationState.status === 'error'"
      type="error"
      message="Transaction simulation failed"
      @close="emit('close')"
    />
    <SimulationMessage
      v-if="!loading && simulationState.status === 'success'"
      type="success"
      message="Transaction simulation successful"
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
            {{ event.message }}
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
