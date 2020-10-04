import Vue from 'vue';
import omit from 'lodash/omit';
import { lsGet, lsSet } from '@/helpers/utils';

const FAVORITES_KEY = 'FAVORITE_SPACES';

const state = {
  favorites: {}
};

const mutations = {
  setFavorites(_state, favorites: Record<string, boolean>) {
    Vue.set(_state, 'favorites', favorites);
  }
};

const actions = {
  loadFavoriteSpaces({ commit }) {
    const favorites = lsGet(FAVORITES_KEY);

    commit('setFavorites', favorites);
  },
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
