import { computed, reactive } from 'vue';

interface SafesnapState {
  batchError:
    | undefined
    | {
        num: number;
        message: string;
      };
}

const state = reactive<SafesnapState>({
  batchError: undefined
});

export function useSafesnap() {
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
