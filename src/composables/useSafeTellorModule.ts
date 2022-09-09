import TELLOR_MODULE_ABI from '@/helpers/abi/TELLOR_MODULE.json';
import { Executor, ExecutorState, ModuleExecutionData } from '@/helpers/safe';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { reactive, readonly } from 'vue';

interface TellorModuleState extends ExecutorState {
  oracleAddress: string | undefined;
}

export function useSafeTellorModule(
  executionData: ModuleExecutionData,
  proposalId: string
): Executor<TellorModuleState> {
  const readProvider = getProvider(executionData.safe.network);

  const state = reactive<TellorModuleState>({
    loading: true,
    hasBeenProposed: false,
    hasBeenExecuted: false,
    canBeExecuted: false,
    hasBeenRejected: false,
    oracleAddress: undefined
  });

  async function setState() {
    state.loading = true;

    const [[tellor]] = await multicall(
      executionData.safe.network,
      readProvider,
      TELLOR_MODULE_ABI,
      [[executionData.module.address, 'tellor', []]]
    );

    state.oracleAddress = tellor;
    state.loading = false;
  }

  async function* proposeExecution() {
    yield;
  }

  async function* disputeExecution() {
    yield;
  }

  async function* execute() {
    yield;
  }

  return {
    state: readonly(state),
    setState,
    proposeExecution,
    disputeExecution,
    execute
  };
}
