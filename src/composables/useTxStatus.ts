import { ref, watch, nextTick } from 'vue';

const pendingCount = ref(0);

export function useTxStatus() {
  watch(pendingCount, () => {
    if (pendingCount.value < 0) {
      pendingCount.value = 0;
    }
  });
  return { pendingCount };
}

export function watchTxStatus(cb) {
  watch(pendingCount, () => nextTick(cb));
}