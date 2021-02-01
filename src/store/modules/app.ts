import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import client from '@/helpers/client';
import { formatProposals, formatSpace } from '@/helpers/utils';
import { version } from '@/../package.json';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  spaces: {}
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  },
  SEND_REQUEST() {
    console.debug('SEND_REQUEST');
  },
  SEND_SUCCESS() {
    console.debug('SEND_SUCCESS');
  },
  SEND_FAILURE(_state, payload) {
    console.debug('SEND_FAILURE', payload);
  },
  GET_PROPOSALS_REQUEST() {
    console.debug('GET_PROPOSALS_REQUEST');
  },
  GET_PROPOSALS_SUCCESS() {
    console.debug('GET_PROPOSALS_SUCCESS');
  },
  GET_PROPOSALS_FAILURE(_state, payload) {
    console.debug('GET_PROPOSALS_FAILURE', payload);
  },
  GET_PROPOSAL_REQUEST() {
    console.debug('GET_PROPOSAL_REQUEST');
  },
  GET_PROPOSAL_SUCCESS() {
    console.debug('GET_PROPOSAL_SUCCESS');
  },
  GET_PROPOSAL_FAILURE(_state, payload) {
    console.debug('GET_PROPOSAL_FAILURE', payload);
  },
  GET_RESULTS_REQUEST() {
    console.debug('GET_PROPOSAL_REQUEST');
  },
  GET_RESULTS_SUCCESS() {
    console.debug('GET_PROPOSAL_SUCCESS');
  },
  GET_RESULTS_FAILURE(_state, payload) {
    console.debug('GET_PROPOSAL_FAILURE', payload);
  },
  GET_POWER_REQUEST() {
    console.debug('GET_POWER_REQUEST');
  },
  GET_POWER_SUCCESS() {
    console.debug('GET_POWER_SUCCESS');
  },
  GET_POWER_FAILURE(_state, payload) {
    console.debug('GET_POWER_FAILURE', payload);
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    const auth = getInstance();
    commit('SET', { loading: true });
    await dispatch('getSpaces');
    auth.getConnector().then(connector => {
      if (connector) dispatch('login', connector);
    });
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleModal: ({ commit }) => {
    commit('SET', { modalOpen: !state.modalOpen });
  },
  getSpaces: async ({ commit }) => {
    let spaces: any = await client.request('spaces');
    spaces = Object.fromEntries(
      Object.entries(spaces).map(space => [
        space[0],
        formatSpace(space[0], space[1])
      ])
    );
    commit('SET', { spaces });
    return spaces;
  },
  send: async ({ commit, dispatch, rootState }, { space, type, payload }) => {
    const auth = getInstance();
    commit('SEND_REQUEST');
    try {
      const msg: any = {
        address: rootState.web3.account,
        msg: JSON.stringify({
          version,
          timestamp: (Date.now() / 1e3).toFixed(),
          space,
          type,
          payload
        })
      };
      msg.sig = await signMessage(auth.web3, msg.msg, rootState.web3.account);
      const result = await client.request('message', msg);
      commit('SEND_SUCCESS');
      dispatch('notify', ['green', `Your ${type} is in!`]);
      return result;
    } catch (e) {
      commit('SEND_FAILURE', e);
      const errorMessage =
        e && e.error_description
          ? `Oops, ${e.error_description}`
          : 'Oops, something went wrong!';
      dispatch('notify', ['red', errorMessage]);
      return;
    }
  },
  getProposals: async ({ commit }, space) => {
    commit('GET_PROPOSALS_REQUEST');
    try {
      let proposals: any = await client.request(`${space.key}/proposals`);
      if (proposals && !space.filters?.onlyMembers) {
        const scores: any = await getScores(
          space.key,
          space.strategies,
          space.network,
          getProvider(space.network),
          Object.values(proposals).map((proposal: any) => proposal.address)
        );
        console.log('Scores', scores);
        proposals = Object.fromEntries(
          Object.entries(proposals).map((proposal: any) => {
            proposal[1].score = scores.reduce(
              (a, b) => a + (b[proposal[1].address] || 0),
              0
            );
            return [proposal[0], proposal[1]];
          })
        );
      }
      commit('GET_PROPOSALS_SUCCESS');
      return formatProposals(proposals);
    } catch (e) {
      commit('GET_PROPOSALS_FAILURE', e);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
