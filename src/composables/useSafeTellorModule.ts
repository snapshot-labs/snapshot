import { reactive, readonly } from 'vue';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import TELLOR_MODULE_ABI from '@/helpers/abi/TELLOR_MODULE.json';
import { Executor, ExecutorState, ModuleExecutionData } from '@/helpers/safe';
import { useTxStatus } from '@/composables';

interface TellorModuleState extends ExecutorState {
  oracleAddress: string | undefined;
}

export function useSafeTellorModule(
  executionData: ModuleExecutionData,
  proposalId: string
): Executor<TellorModuleState> {
  const readProvider = getProvider(executionData.safe.network);
  const { pendingCount } = useTxStatus();

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

  async function proposeExecution() {
    pendingCount.value++;
    pendingCount.value--;
  }

  async function disputeExecution() {
    pendingCount.value++;
    pendingCount.value--;
  }

  async function execute() {
    pendingCount.value++;
    pendingCount.value--;
  }

  return {
    state: readonly(state),
    setState,
    proposeExecution,
    disputeExecution,
    execute
  };
}
