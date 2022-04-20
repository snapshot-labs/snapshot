import { computed } from 'vue';
import { useStorage, watchDebounced } from '@vueuse/core';
import { useApp } from '@/composables/useApp';

const { init } = useApp();

const defaultHubUrl = import.meta.env.VITE_HUB_URL;
const hubUrl = useStorage('snapshot.hubUrl', defaultHubUrl);
const isDefaultHubUrl = computed(() => hubUrl.value === defaultHubUrl);

// when hub url changes
watchDebounced(hubUrl, init, { debounce: 1000 });

export function useHub() {
  return {
    defaultHubUrl,
    hubUrl,
    isDefaultHubUrl
  };
}
