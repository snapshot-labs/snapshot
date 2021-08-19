import { ref } from 'vue';

const pendingCount = ref(1);

export function useTxStatus() {
  return { pendingCount };
}