import { onMounted } from 'vue';
import { useStorage } from '@vueuse/core';

export function useTimestamp() {
  const timestamp = useStorage('timestamp', 0);

  function updateTimestamp() {
    timestamp.value = Number((Date.now() / 1e3).toFixed());
  }

  onMounted(() => {
    if (timestamp.value) return;
    timestamp.value = Number((Date.now() / 1e3).toFixed());
  });

  return { updateTimestamp, timestamp };
}
