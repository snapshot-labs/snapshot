import { computed, reactive } from 'vue';

interface ExecutionStatus {
  batchError:
    | undefined
    | {
        num: number;
        message: string;
      };
}

const state = reactive<ExecutionStatus>({
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
