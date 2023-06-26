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

const defaultProgress: Progress = {
  [Step.CHECK_WETH_BALANCE]: {
    name: 'Checking WETH balance',
    description: '',
    status: Status.FUTURE
  },
  [Step.APPROVE_WETH_BALANCE]: {
    name: 'Approving WETH spending',
    description: '',
    status: Status.FUTURE
  },
  [Step.SEND_TX]: {
    name: 'Minting',
    description: '',
    status: Status.FUTURE
  },
  [Step.RESULT]: {
    name: 'Confirming',
    description: '',
    status: Status.FUTURE
  }
};

const progress = ref<Progress>(clone(defaultProgress));

export function useNFTClaimerProgress() {
  function updateProgress(key: Step, status: Status, description: string) {
    progress.value[key].status = status;
    progress.value[key].description = description;
  }

  function resetProgress() {
    progress.value = clone(defaultProgress);
  }

  return {
    Step,
    Status,
    progress,
    updateProgress,
    resetProgress
  };
}
