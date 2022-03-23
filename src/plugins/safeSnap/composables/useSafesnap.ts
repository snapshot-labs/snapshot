import { computed, reactive } from 'vue';

interface SafesnapState {
  config: {
    spaceId: string;
  };
  batchError:
    | undefined
    | {
        num: number;
        message: string;
      };
}

const state = reactive<SafesnapState>({
  config: {
    spaceId: ''
  },
  batchError: undefined
});

export function useSafesnap() {
  function setBatchError(num: number, message: string) {
    state.batchError = { num, message };
  }

  function clearBatchError() {
    state.batchError = undefined;
  }

  function setConfig(config: SafesnapState['config']) {
    state.config = config;
  }

  return {
    setBatchError,
    clearBatchError,
    setConfig,
    safesnap: computed(() => state)
  };
}
