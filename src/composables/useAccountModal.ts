import { ref } from 'vue';

const accountModalOpen = ref(false);
export function useAccountModal() {
  return { accountModalOpen };
}
