import { createGlobalState } from '@vueuse/core';

const useFlaggedMessageState = createGlobalState(() => {
  const flaggedMessageStateMap = ref({});

  return {
    setVisibility: (id, state) => {
      const isNotVisible = flaggedMessageStateMap.value[id] === false;

      if (isNotVisible) return;

      flaggedMessageStateMap.value = {
        ...flaggedMessageStateMap.value,
        [id]: state
      };
    },
    isFlaggedMessageVisible: id => {
      return flaggedMessageStateMap.value[id] || false;
    }
  };
});

export function useFlaggedMessageStatus(pageId: Ref<string> | string) {
  const { setVisibility, isFlaggedMessageVisible } = useFlaggedMessageState();
  const id = typeof pageId === 'string' ? pageId : pageId.value;

  return {
    isMessageVisible: computed(() => isFlaggedMessageVisible(id)),
    setMessageVisibility: (state: boolean) => setVisibility(id, state)
  };
}
