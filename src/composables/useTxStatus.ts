import { ref } from 'vue';

const pendingCount = ref(0);

export function useTxStatus() {
  return { pendingCount };
}