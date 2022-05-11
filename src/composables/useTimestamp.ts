import { onMounted, ref } from 'vue';

const timestamp = ref(0);

export function useTimestamp() {
  function updateTimestamp() {
    timestamp.value = Number((Date.now() / 1e3).toFixed());
  }

  onMounted(() => {
    if (timestamp.value) return;
    timestamp.value = Number((Date.now() / 1e3).toFixed());
  });

  return { updateTimestamp, timestamp };
}
