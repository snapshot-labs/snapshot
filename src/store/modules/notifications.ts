const state = {
  items: []
};

const mutations = {
  notify(_state, payload) {
    _state.items.push({ ...payload, timestamp: Date.now() });
  }
};

const actions = {
  notify({ commit }, payload) {
    Array.isArray(payload)
      ? commit('notify', { message: payload[1], type: payload[0] })
      : commit('notify', { message: payload, type: 'green' });
  }
};

export default {
  state,
  mutations,
  actions
};
