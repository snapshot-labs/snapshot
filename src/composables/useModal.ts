const modalAccountOpen = ref(false);
const isModalPostVoteOpen = ref(false);
const modalEmailOpen = ref(false);

export function useModal() {
  return { modalAccountOpen, isModalPostVoteOpen, modalEmailOpen };
}
