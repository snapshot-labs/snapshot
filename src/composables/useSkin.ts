import { ref, computed, watch } from 'vue';
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACE_SKIN_QUERY } from '@/helpers/queries';
import { useStorage } from '@vueuse/core';

const NOT_SET = 'not-set';
const DARK = 'dark';
const LIGHT = 'light';

const osSkin =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK
    : LIGHT;

const storedUserThemePreference = useStorage(
  'snapshot.userThemePreference',
  NOT_SET
);

const userThemePreference = computed(() =>
  storedUserThemePreference.value === NOT_SET
    ? osSkin
    : storedUserThemePreference.value
);

const changeStoredTheme = skin => {
  if (skin === LIGHT) {
    storedUserThemePreference.value = DARK;
  } else {
    storedUserThemePreference.value = LIGHT;
  }
};

const skinName = ref('');

export function useSkin() {
  const { apolloQuery } = useApolloQuery();
  const { domain } = useDomain();

  function toggleUserTheme() {
    if (storedUserThemePreference.value === NOT_SET) {
      changeStoredTheme(osSkin);
    } else {
      changeStoredTheme(storedUserThemePreference.value);
    }
  }

  const skin = computed(() => {
    if (domain && skinName.value !== 'default') {
      return skinName.value;
    }
    return userThemePreference.value;
  });

  async function getSkin() {
    if (domain) {
      const spaceObj = await apolloQuery(
        {
          query: SPACE_SKIN_QUERY,
          variables: {
            id: domain
          }
        },
        'space'
      );
      skinName.value = spaceObj?.skin;
    }
  }

  const getSkinIcon = () =>
    userThemePreference.value === LIGHT ? 'moon' : 'sun';

  watch(
    userThemePreference,
    () => {
      document.documentElement.setAttribute(
        'data-color-scheme',
        userThemePreference.value === LIGHT ? 'light' : 'dark'
      );
    },
    { immediate: true }
  );

  return {
    skin,
    userThemePreference,
    getSkinIcon,
    toggleUserTheme,
    getSkin
  };
}
