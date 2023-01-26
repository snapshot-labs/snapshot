import { ref } from 'vue';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

const isLoading = ref(false);
const error = ref(false);

export function useSnapshot() {
  async function getSnapshot(network: string) {
    try {
      isLoading.value = true;
      error.value = false;
      const currentBlock = await getBlockNumber(getProvider(network));
      console.log('Snapshot block number', currentBlock);
      isLoading.value = false;
      return currentBlock - 4;
    } catch (e) {
      error.value = true;
      isLoading.value = false;
    }
  }

  return {
    getSnapshot,
    isSnapshotLoading: isLoading,
    errorFetchingSnapshot: error
  };
}
