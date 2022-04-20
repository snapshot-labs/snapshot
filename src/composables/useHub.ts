import { computed } from 'vue';
import { useStorage } from '@vueuse/core';

const defaultHubUrl = computed(() => import.meta.env.VITE_HUB_URL);
const hubUrl = useStorage('snapshot.hubUrl', defaultHubUrl.value);
const isDefaultHubUrl = computed(() => hubUrl.value === defaultHubUrl.value);

export function useHub() {
  return {
    defaultHubUrl,
    hubUrl,
    isDefaultHubUrl
  };
}
