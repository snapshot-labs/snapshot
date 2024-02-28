<script setup lang="ts">
import { Network } from '../../types';
import { shorten } from '../../../../helpers/utils';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { formatUnits } from '@ethersproject/units';
import {
  CustomConnextTransaction,
  SafeTransactionConfig,
  SimulationLog,
  SimulationState
} from '../../../../helpers/interfaces';
import SimulationMessage from './Message.vue';
import { ref } from 'vue';
import { isAddress } from '@ethersproject/address';

export interface TenderlySimulationBody {
  from: string;
  gas: number; //8000000
  gas_price: number; //0
  input: string;
  network_id: string;
  save: boolean;
  to: string; //
  value: string;
  state_objects?: Object;
  save_if_fails: boolean;
  simulation_type?: 'full';
}

type SimulationTenderlyProps = {
  modelValueToSimulate: CustomConnextTransaction;
  config: SafeTransactionConfig;
  runSimulation: boolean;
  defaultSimulationResult?: SimulationState;
  isDetails?: boolean;
};

type TenderlySimulation = {
  id: string;
  status: boolean;
  method: string;
};

type LogInput = {
  soltype: {
    name: string;
    type: string;
    storage_location: string;
    offset: number;
    index: string;
    indexed?: boolean;
    simple_type: {
      type: string;
    };
  };
  value: string;
};

type Log = {
  name: string;
  methodName?: string;
  anonymous: boolean;
  inputs: LogInput[] | null;
  raw?: {
    address: string;
    topics: string[];
    data: string;
  };
  trace_index: number | null;
};

type AddEventFunction = (
  type: string,
  message: string,
  simulationId?: string
) => void;

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
      logs: any[];
    };
    logs: any[];
  };
};

type TenderlySimulationResult = {
  simulation_results: {
    transaction: TenderlyResultTransaction;
    simulation: TenderlySimulation;
  }[];
};

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
  transaction: CustomConnextTransaction,
  network: Network
): TenderlySimulationBody[] => {
  const { destinationTx, destinationChain, zodiacMod, originTx, approveTx } =
    transaction;

  if (approveTx && originTx) {
    return [
      {
        network_id: network,
        from: props.config.gnosisSafeAddress,
        to: approveTx.to,
        input: approveTx.data,
        value: approveTx.value,
        save: true,
        save_if_fails: true,
        gas: 8000000,
        gas_price: 0,
        simulation_type: 'full'
      },
      {
        network_id: network,
        from: originTx.from,
        to: originTx.to,
        input: originTx.data,
        value: originTx.value,
        save: true,
        save_if_fails: true,
        gas: 8000000,
        gas_price: 0
      }
    ];
  } else {
    return [
      {
        network_id: network,
        from: props.config.gnosisSafeAddress,
        to: transaction.to,
        input: transaction.data,
        value: transaction.value,
        save: true,
        save_if_fails: true,
        gas: 8000000,
        gas_price: 0,
        simulation_type: 'full',
        state_objects: {
          [props.config.gnosisSafeAddress]: {
            balance: '99999999999999999999'
          }
        }
      },
      {
        network_id: destinationChain,
        from: zodiacMod,
        to: destinationTx.to,
        input: destinationTx.data,
        value: destinationTx.value,
        save: true,
        save_if_fails: true,
        gas: 8000000,
        gas_price: 0,
        simulation_type: 'full'
      }
    ];
  }
};

const extractTransactionResult = (
  simulationResult: TenderlySimulationResult
) => {
  let events: SimulationLog[] = [];
  simulationResult.simulation_results.forEach(result => {
    const transaction = result.transaction;
    const simulationId = result.simulation.id;
    const method = result.simulation.method;

    const addEvent = (type: string, message: string, simulationId?: string) => {
      events.push({
        type,
        message,
        url: generateSimulationUrl(simulationId ?? '')
      });
    };

    if (transaction.status) {
      simulationState.value.status = 'success';
      simulationState.value.id = simulationId;
      const logs = transaction.transaction_info.logs;
      logs.forEach(log => {
        const inputsMap = log.inputs
          ? new Map(log.inputs.map(input => [input.soltype.name, input.value]))
          : new Map();

        switch (log.name) {
          case 'SafeReceived':
          case 'TransferRelayerFeesIncreased':
          case 'LeafInserted':
          case 'Dispatch':
          case 'XCalled':
            specificLogHandler(log.name, inputsMap, addEvent, simulationId);
            break;
          default:
            genericLogHandler(log, addEvent, simulationId, method);
            break;
        }
      });
    } else {
      simulationState.value.status = 'error';
      addEvent(
        `The transaction failed during the simulation throwing error ${transaction.error_message}. Full simulation report is available on`,
        'Tenderly.',
        simulationId
      );
    }
    simulationState.value.logs = events;
  });
};

const specificLogHandler = (
  logName: string,
  inputsMap: Map<string, string>,
  addEvent: AddEventFunction,
  simulationId: string
) => {
  if (logName === 'SafeReceived') {
    const sender = inputsMap.get('sender');
    const value = inputsMap.get('value');
    if (sender && value) {
      addEvent(
        'Safe Received',
        ` from ${shorten(sender.toString())} value ${formatUnits(
          value.toString()
        )}`,
        simulationId
      );
    }
  }
  if (logName === 'TransferRelayerFeesIncreased') {
    const transferId = inputsMap.get('transferId');
    const increase = inputsMap.get('increase');
    if (transferId && increase) {
      addEvent(
        'Transfer relayer fees increased',
        ` for transferId ${shorten(
          transferId.toString()
        )}, increase ${formatUnits(increase.toString())}`,
        simulationId
      );
    }
  }
  if (logName === 'LeafInserted') {
    const root = inputsMap.get('root');
    const count = inputsMap.get('count');
    if (root && count) {
      addEvent(
        'Leaf Inserted',
        ` with root ${shorten(root.toString())} and count ${count}`,
        simulationId
      );
    }
  }
  if (logName === 'Dispatch') {
    const leaf = inputsMap.get('leaf');
    const index = inputsMap.get('index');
    if (leaf && index) {
      addEvent(
        'Dispatch',
        ` called with leaf ${shorten(leaf.toString())} and index ${index}`,
        simulationId
      );
    }
  }
  if (logName === 'XCalled') {
    const xCalledTransferId = inputsMap.get('transferId');
    const asset = inputsMap.get('asset');
    const amount = inputsMap.get('amount');
    if (xCalledTransferId && asset && amount) {
      addEvent(
        'XCalled',
        ` with transferId ${shorten(
          xCalledTransferId.toString()
        )}, asset ${shorten(asset.toString())}`,
        simulationId
      );
    }
  }
};

const genericLogHandler = (
  log: Log,
  addEvent: AddEventFunction,
  simulationId: string,
  method: string
) => {
  let message = log.methodName ? `${log.methodName}: ` : method;
  log.inputs?.forEach(input => {
    let value = input.value;
    if (isAddress(value)) {
      value = shorten(value);
    }
    if (value.length > 40) {
      value = shorten(value);
    }
    message += `${input.soltype.name}: ${value}, `;
  });
  message = message.replace(/, $/, '');
  addEvent(log.name || 'Generic Event', message, simulationId);
};
const simulateTransaction = async (
  transactions: CustomConnextTransaction
): Promise<TenderlySimulationResult> => {
  const apiURL = `https://api.tenderly.co/api/v1/account/juliopavilaa/project/safesnap-plugin/simulate-bundle`;
  const body = {
    simulations: generateTransactionBody(transactions, props.config.network)
  };

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
  loading.value = true;
  try {
    if (props.modelValueToSimulate && props.modelValueToSimulate) {
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
