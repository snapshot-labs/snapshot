import { ref, computed, watch } from 'vue';
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACE_SKIN_QUERY } from '@/helpers/queries';
import { useStorage } from '@vueuse/core';


/**
 * Handle theme (dark/light mode)
 * - use local storage or fall back to OS preference
 */
const DARK = 'dark';
const LIGHT = 'light';

const osTheme =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK
    : LIGHT;

const userTheme = useStorage(
  'snapshot.userTheme',
  osTheme
);

function toggleUserTheme() {
  if (userTheme.value === LIGHT) {
    userTheme.value = DARK;
  } else {
    userTheme.value = LIGHT;
  }
}

const theme = computed(() => [DARK, LIGHT].includes(userTheme.value) ? userTheme.value : osTheme);

/**
 * Handle skin (e.g. uniswap)
 */
const skin = ref('default');

export function useSkin() {
  const { apolloQuery } = useApolloQuery();
  const { domain } = useDomain();

  async function getSkin() {
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
        skin.value = space.skin;
      }
    }
  }

  const getThemeIcon = () =>
    theme.value === LIGHT ? 'moon' : 'sun';

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
    skin,
    theme,
    getThemeIcon,
    toggleUserTheme,
    getSkin
  };
}
