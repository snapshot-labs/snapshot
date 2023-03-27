const modalAccountOpen = ref(false);
const isModalPostVoteOpen = ref(false);

export function useModal() {
  return { modalAccountOpen, isModalPostVoteOpen };
}
