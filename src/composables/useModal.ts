import { ref } from 'vue';

const modalOpen = ref(false);
const modalAccountOpen = ref(false);

export function useModal() {
  return { modalOpen, modalAccountOpen };
}
