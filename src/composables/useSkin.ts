import { SPACE_SKIN_QUERY } from '@/helpers/queries';
import { useStorage, usePreferredColorScheme } from '@vueuse/core';

export const DARK = 'dark';
export const LIGHT = 'light';

const preferredColor = usePreferredColorScheme();

const userTheme = useStorage('snapshot.userTheme', '');

function toggleUserTheme() {
  if (userTheme.value === LIGHT) {
    userTheme.value = DARK;
  } else {
    userTheme.value = LIGHT;
  }
}

const theme = computed(() =>
  [DARK, LIGHT].includes(userTheme.value)
    ? userTheme.value
    : preferredColor.value
);

const skinClass = ref('default');

export function useSkin() {
  const { apolloQuery } = useApolloQuery();

  async function getSkin(domain: string): Promise<string | null> {
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

        return space.skin;
      }
    }

    return null;
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
    getThemeIcon,
    toggleUserTheme,
    getSkin
  };
}
