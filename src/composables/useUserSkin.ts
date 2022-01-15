import { ref, watch } from 'vue';
import { lsGet, lsSet } from '@/helpers/utils';

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

export function useUserSkin() {
  function toggleSkin() {
    const currentSkin = lsGet('skin', NOT_SET);
    if (currentSkin === NOT_SET) {
      _toggleSkin(osSkin);
    } else {
      _toggleSkin(currentSkin);
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
    userSkin,
    getSkinIcon,
    toggleSkin
  };
}
