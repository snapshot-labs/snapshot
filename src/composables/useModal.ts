import { ref, watch } from 'vue';

const modalOpen = ref(false);
const modalAccountOpen = ref(false);

watch(modalOpen, isOpen => {
  document.body.classList[isOpen ? 'add' : 'remove']('overflow-hidden');
});

export function useModal() {
  return { modalOpen, modalAccountOpen };
}
