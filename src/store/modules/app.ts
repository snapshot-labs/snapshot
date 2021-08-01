import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import client from '@/helpers/client';
import { formatSpace } from '@/helpers/utils';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  spaces: {},
  strategies: {}
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    const auth = getInstance();
    commit('SET', { loading: true });
    await Promise.all([dispatch('getSpaces'), dispatch('getStrategies')]);
    auth.getConnector().then(connector => {
      if (connector) dispatch('login', connector);
    });
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  getSpaces: async ({ commit }) => {
    let spaces: any = await client.getSpaces();
    spaces = Object.fromEntries(
      Object.entries(spaces).map(space => [
        space[0],
        formatSpace(space[0], space[1])
      ])
    );
    commit('SET', { spaces });
    return spaces;
  },
  getStrategies: async ({ commit }) => {
    const strategies: any = await fetch(
      'https://score.snapshot.org/api/strategies'
    ).then(res => res.json());
    commit('SET', { strategies });
    return strategies;
  }
};

export default {
  state,
  mutations,
  actions
};
