import { ref, computed, watch } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACE_SKIN_QUERY } from '@/helpers/queries';
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

/**
 * Handle skin (e.g. uniswap)
 */
const skinClass = ref('default');

export function useSkin() {
  const { apolloQuery } = useApolloQuery();

  async function getSkin(domain: string) {
    if (domain) {
      const space = await apolloQuery(
        {
          query: SPACE_SKIN_QUERY,
          variables: {
            id: domain
          }
        },
        'space'
      );
      if (space?.skin) {
        skinClass.value = space.skin;
        document.body.classList.add(skinClass.value);
      }
    }
  }

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
    skinClass,
    userTheme,
    theme,
    getThemeIcon,
    toggleUserTheme,
    getSkin
  };
}
