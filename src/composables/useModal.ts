import { ref } from 'vue';

const modalAccountOpen = ref(false);

export function useModal() {
  return { modalAccountOpen };
}
