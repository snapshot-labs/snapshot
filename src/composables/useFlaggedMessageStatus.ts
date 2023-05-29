import { createGlobalState } from '@vueuse/core';

const useFlaggedMessageHiddenState = createGlobalState(() => {
  const scamMessagesHiddenMap = ref({});

  return {
    setHiddenFlaggedMessage: (id, state) => {
      const isAlreadyHidden = scamMessagesHiddenMap.value[id] === false;

      if (isAlreadyHidden) return;

      scamMessagesHiddenMap.value = {
        ...scamMessagesHiddenMap.value,
        [id]: state
      };
    },
    isFlaggedMessageVisible: id => {
      return scamMessagesHiddenMap.value[id] || false;
    }
  };
});

export function useFlaggedMessageStatus(pageId: Ref<string> | string) {
  const { setHiddenFlaggedMessage, isFlaggedMessageVisible } =
    useFlaggedMessageHiddenState();
  const id = typeof pageId === 'string' ? pageId : pageId.value;

  const isMessageVisible = computed(() => isFlaggedMessageVisible(id));

  return {
    isMessageVisible,
    setMessageVisibility: (state: boolean) => setHiddenFlaggedMessage(id, state)
  };
}
