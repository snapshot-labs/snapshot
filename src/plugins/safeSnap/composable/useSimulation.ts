// useSimulation.ts
import { ref } from 'vue';
import {
  CustomConnextTransaction,
  SafeTransactionConfig,
  SimulationLog,
  SimulationState
} from '@/helpers/interfaces';

import { shorten } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';

interface TenderlySimulationBody {
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
  shared: boolean;
  public: boolean;
  simulation_type?: 'full';
}

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

export function useSimulation(
  emitUpdate: (state: SimulationState) => void,
  defaultSimulationResult?: SimulationState
) {
  const loading = ref<boolean>(false);
  const defaultState: SimulationState = defaultSimulationResult ?? {
    status: 'idle',
    logs: []
  };
  const simulationState = ref<SimulationState>(defaultState);

  const generateSimulationUrl = (id: string): string => {
    return `https://dashboard.tenderly.co/public/gnosisguild/safesnap/simulator/${id}`;
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

  const extractTransactionResult = (
    simulationResult: TenderlySimulationResult
  ) => {
    let events: SimulationLog[] = [];
    simulationResult.simulation_results.forEach(result => {
      const transaction = result.transaction;
      const simulationId = result.simulation.id;
      const method = result.simulation.method;

      const addEvent = (
        type: string,
        message: string,
        simulationId?: string
      ) => {
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
            ? new Map(
                log.inputs.map(input => [input.soltype.name, input.value])
              )
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

  function createTransactionBody({
    network_id,
    from,
    to,
    input,
    value,
    additionalProps = {}
  }: {
    network_id: string;
    from: string;
    to: string;
    input: string;
    value: string;
    additionalProps?: Partial<TenderlySimulationBody>;
  }): TenderlySimulationBody {
    return {
      network_id,
      from,
      to,
      input,
      value,
      save: true,
      save_if_fails: true,
      gas: 8000000,
      gas_price: 0,
      simulation_type: 'full',
      shared: true,
      public: true,
      ...additionalProps
    };
  }

  const generateTransactionBody = (
    transaction: CustomConnextTransaction,

    config: SafeTransactionConfig
  ): TenderlySimulationBody[] => {
    const { destinationTx, destinationChain, zodiacMod, originTx, approveTx } =
      transaction;
    const transactions: TenderlySimulationBody[] = [];
    if (approveTx && originTx) {
      transactions.push(
        createTransactionBody({
          network_id: config.network,
          from: config.gnosisSafeAddress,
          to: approveTx.to,
          input: approveTx.data,
          value: approveTx.value
        })
      );

      transactions.push(
        createTransactionBody({
          network_id: config.network,
          from: originTx.from,
          to: originTx.to,
          input: originTx.data,
          value: originTx.value
        })
      );
    } else {
      transactions.push(
        createTransactionBody({
          network_id: config.network,
          from: config.gnosisSafeAddress,
          to: transaction.to,
          input: transaction.data,
          value: transaction.value,
          additionalProps: {
            state_objects: {
              [config.gnosisSafeAddress]: { balance: '99999999999999999999' }
            }
          }
        })
      );

      transactions.push(
        createTransactionBody({
          network_id: destinationChain,
          from: zodiacMod,
          to: destinationTx.to,
          input: destinationTx.data,
          value: destinationTx.value
        })
      );
    }

    return transactions;
  };

  async function simulateTransaction(
    transactions: CustomConnextTransaction,
    config: SafeTransactionConfig
  ): Promise<TenderlySimulationResult> {
    const apiURL = `https://safesnap-simulation.gnosisguild.workers.dev`;
    const body = {
      simulations: generateTransactionBody(transactions, config)
    };
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON'
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
  }

  async function simulate(
    transactions: CustomConnextTransaction,
    config: SafeTransactionConfig
  ) {
    loading.value = true;
    try {
      const tenderlySimulation = await simulateTransaction(
        transactions,
        config
      );
      extractTransactionResult(tenderlySimulation);
    } catch (error) {
      console.error('Error during simulation:', error);
      simulationState.value = {
        status: 'error',
        logs: [
          { type: 'error', message: 'An error occurred during simulation.' }
        ]
      };
    } finally {
      loading.value = false;
      emitUpdate(simulationState.value);
    }
  }

  return { simulate, simulationState, loading };
}
