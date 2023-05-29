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
      }
    },
    isMessageVisible: (id) => {
      return scamMessagesHiddenMap.value[id] || false;
    }
  }
});

export function useFlaggedMessageHiddenStatus(pageId: Ref<string> | string) {
  const { setHiddenFlaggedMessage, isMessageVisible } = useFlaggedMessageHiddenState();
  const id = typeof pageId === 'string' ? pageId : pageId.value;

  const isHidden = computed(() => isMessageVisible(id));

  return {
    isHidden,
    setHidden: (state: boolean) => setHiddenFlaggedMessage(id, state)
  }
}
