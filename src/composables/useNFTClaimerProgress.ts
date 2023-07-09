import { clone } from '@snapshot-labs/snapshot.js/src/utils';

enum Step {
  CHECK_WETH_BALANCE,
  APPROVE_WETH_BALANCE,
  SEND_TX,
  RESULT
}

enum Status {
  SUCCESS,
  ERROR,
  FUTURE,
  WORKING
}

type Progress = Record<
  Step,
  { name: string; description: string; status: Status }
>;

const defaultProgressItem = { description: '', status: Status.FUTURE };
const defaultProgress: Progress = {
  [Step.CHECK_WETH_BALANCE]: {
    name: 'Checking WETH balance',
    ...defaultProgressItem
  },
  [Step.APPROVE_WETH_BALANCE]: {
    name: 'Approving WETH spending',
    ...defaultProgressItem
  },
  [Step.SEND_TX]: {
    name: 'Minting',
    ...defaultProgressItem
  },
  [Step.RESULT]: {
    name: 'Confirming',
    ...defaultProgressItem
  }
};

const progress = ref<Progress>(clone(defaultProgress));

export function useNFTClaimerProgress() {
  const errored = ref(false);

  function updateProgress(key: Step, status: Status, description: string) {
    progress.value[key].status = status;
    progress.value[key].description = description;

    if (status === Status.ERROR) {
      errored.value = true;
    }
  }

  function resetProgress() {
    progress.value = clone(defaultProgress);
    errored.value = false;
  }

  return {
    Step,
    Status,
    progress,
    updateProgress,
    resetProgress,
    errored
  };
}
