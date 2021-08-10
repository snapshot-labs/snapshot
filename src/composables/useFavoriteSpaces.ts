import { ref } from 'vue';
import omit from 'lodash/omit';
import { lsGet, lsSet } from '@/helpers/utils';

const FAVORITES_KEY = 'FAVORITE_SPACES';

const favorites = ref(lsGet(FAVORITES_KEY, {}));

export function useFavoriteSpaces() {
  function addFavoriteSpace(spaceId: string) {
    const newFavorites = { ...favorites.value, [spaceId]: true };

    lsSet(FAVORITES_KEY, newFavorites);
    favorites.value = newFavorites;
  }

  function removeFavoriteSpace(spaceId: string) {
    const newFavorites = omit(favorites.value, spaceId);

    lsSet(FAVORITES_KEY, newFavorites);
    favorites.value = newFavorites;
  }

  return { addFavoriteSpace, removeFavoriteSpace, favorites };
}
