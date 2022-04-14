import { computed, watch } from 'vue';
import { useStorage, useMediaQuery } from '@vueuse/core';

/**
 * Handle theme (dark/light mode)
 * - use local storage or fall back to OS preference
 */
const DARK = 'dark';
const LIGHT = 'light';

const osTheme = useMediaQuery('(prefers-color-scheme: dark)') ? DARK : LIGHT;

const userTheme = useStorage('snapshot.userTheme', osTheme);

function toggleUserTheme() {
  if (userTheme.value === LIGHT) {
    userTheme.value = DARK;
  } else {
    userTheme.value = LIGHT;
  }
}

const theme = computed(() =>
  [DARK, LIGHT].includes(userTheme.value) ? userTheme.value : osTheme
);

export function useTheme() {
  const getThemeIcon = () => (theme.value === LIGHT ? 'moon' : 'sun');

  watch(
    theme,
    () => {
      document.documentElement.setAttribute(
        'data-color-scheme',
        theme.value === LIGHT ? 'light' : 'dark'
      );
    },
    { immediate: true }
  );

  return {
    userTheme,
    theme,
    getThemeIcon,
    toggleUserTheme
  };
}
