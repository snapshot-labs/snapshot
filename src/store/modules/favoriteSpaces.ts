import omit from 'lodash/omit';
import { lsGet, lsSet } from '@/helpers/utils';

const FAVORITES_KEY = 'FAVORITE_SPACES';

const state = {
  favorites: lsGet(FAVORITES_KEY, {})
};

const mutations = {
  setFavorites(_state, favorites: Record<string, boolean>) {
    _state.favorites = favorites;
  }
};

const actions = {
  addFavoriteSpace({ commit, state }, spaceId: string) {
    const favorites = { ...state.favorites, [spaceId]: true };

    lsSet(FAVORITES_KEY, favorites);
    commit('setFavorites', favorites);
  },
  removeFavoriteSpace({ commit, state }, spaceId: string) {
    const favorites = omit(state.favorites, spaceId);

    lsSet(FAVORITES_KEY, favorites);
    commit('setFavorites', favorites);
  }
};

export default {
  state,
  mutations,
  actions
};
