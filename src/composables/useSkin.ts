import { ref, computed, watch } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACE_SKIN_QUERY } from '@/helpers/queries';

const NOT_SET = 'not-set';
const DARK_MODE = 'dark-mode';
const LIGHT_MODE = 'light-mode';

const currenSkin = lsGet('skin', NOT_SET);
const osSkin =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK_MODE
    : LIGHT_MODE;

const userSkin = ref(currenSkin === NOT_SET ? osSkin : currenSkin);
const getSkinIcon = () => (userSkin.value === LIGHT_MODE ? 'moon' : 'sun');
const _toggleSkin = skin => {
  if (skin === LIGHT_MODE) {
    lsSet('skin', DARK_MODE);
    userSkin.value = DARK_MODE;
  } else {
    lsSet('skin', LIGHT_MODE);
    userSkin.value = LIGHT_MODE;
  }
};

export function useSkin() {
  const { apolloQuery } = useApolloQuery();
  const { domain } = useDomain();

  const skinName = ref('');

  function toggleSkin() {
    const currentSkin = lsGet('skin', NOT_SET);
    if (currentSkin === NOT_SET) {
      _toggleSkin(osSkin);
    } else {
      _toggleSkin(currentSkin);
    }
  }

  const skin = computed(() => {
    if (domain && skinName.value !== 'default') {
      let skinClass = skinName.value;
      if (userSkin.value === 'dark-mode')
        skinClass += ` ${skinName.value}-dark-mode`;
      return skinClass;
    }
    return userSkin.value;
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

  watch(
    userSkin,
    () => {
      document.documentElement.setAttribute(
        'data-color-scheme',
        userSkin.value === LIGHT_MODE ? 'light' : 'dark'
      );
    },
    { immediate: true }
  );

  return {
    skin,
    userSkin,
    getSkinIcon,
    toggleSkin,
    getSkin
  };
}
