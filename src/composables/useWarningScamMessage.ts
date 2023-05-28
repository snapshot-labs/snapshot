import { createGlobalState } from '@vueuse/core';

const useScamMessageStateStorage = createGlobalState(() => {
  const scamMessagesHiddenMap = ref({});

  return {
    setScamMessages: (id, state) => {
      const isAlreadyHidden = scamMessagesHiddenMap.value[id] === false;

      if (isAlreadyHidden) return;

      scamMessagesHiddenMap.value = {
        ...scamMessagesHiddenMap.value,
        [id]: state
      }
    },
    isMessageVisible: (id) => {
      return scamMessagesHiddenMap.value[id] || false;
    }
  }
});

export function useWarningScamMessage(pageId: Ref<string> | string) {
  const { setScamMessages, isMessageVisible } = useScamMessageStateStorage();
  const id = typeof pageId === 'string' ? pageId : pageId.value;

  const isHidden = computed(() => isMessageVisible(id));

  return {
    isHidden,
    setHidden: (state: boolean) => setScamMessages(id, state)
  }
}
