import { ref } from 'vue';

const modalAccountOpen = ref(false);
export function useAccountModal() {
  return { modalAccountOpen };
}
