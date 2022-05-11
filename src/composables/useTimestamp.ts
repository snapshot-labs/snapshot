import { ref } from 'vue';

const timestamp = ref(0);

export function useTimestamp() {
  function updateTimestamp(ts) {
    timestamp.value = ts;
  }

  return { updateTimestamp, timestamp };
}
