import { computed, reactive } from 'vue';
import { SafeExecutionStatus } from '@/helpers/interfaces';

const state = reactive<SafeExecutionStatus>({
  batchError: undefined
});

export function useSafe() {
  function setBatchError(num: number, message: string) {
    state.batchError = { num, message };
  }

  function clearBatchError() {
    state.batchError = undefined;
  }

  return {
    setBatchError,
    clearBatchError,
    safesnap: computed(() => state)
  };
}
