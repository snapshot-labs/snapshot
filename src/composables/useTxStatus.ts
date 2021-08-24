import { ref, watch, nextTick } from 'vue';

const pendingCount = ref(0);

export function useTxStatus() {
  return { pendingCount };
}

export function watchTxStatus(cb) {
  watch(pendingCount, () => nextTick(cb));
}