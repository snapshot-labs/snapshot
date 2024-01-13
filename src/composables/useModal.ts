const modalAccountOpen = ref(false);
const isModalPostVoteOpen = ref(true);
const modalEmailOpen = ref(false);

export function useModal() {
  return { modalAccountOpen, isModalPostVoteOpen, modalEmailOpen };
}
