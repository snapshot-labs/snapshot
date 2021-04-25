import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import client from '@/helpers/client';
import { formatSpace } from '@/helpers/utils';
import i18n, {
  defaultLocale,
  setI18nLanguage,
  loadLocaleMessages
} from '@/i18n';

import { lsGet, lsSet } from '@/helpers/utils';

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  spaces: {},
  locale: lsGet('locale', defaultLocale)
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
  }
};

const actions = {
  init: async ({ commit, dispatch }) => {
    await loadLocaleMessages(i18n, state.locale);
    setI18nLanguage(i18n, state.locale);
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
  send: async ({ commit, dispatch, rootState }, { space, type, payload }) => {
    const auth = getInstance();
    commit('SEND_REQUEST');
    try {
      const result = await client.broadcast(
        auth.web3,
        rootState.web3.account,
        space,
        type,
        payload
      );
      commit('SEND_SUCCESS');
      dispatch('notify', [
        'green',
        type === 'delete-proposal'
          ? i18n.global.t('notify.proposalDeleted')
          : i18n.global.t('notify.yourIsIn', [type])
      ]);
      return result;
    } catch (e) {
      commit('SEND_FAILURE', e);
      const errorMessage =
        e && e.error_description
          ? `Oops, ${e.error_description}`
          : i18n.global.t('notify.somethingWentWrong');
      dispatch('notify', ['red', errorMessage]);
      return;
    }
  },
  async setLocale(state, locale) {
    state.locale = locale;
    lsSet('locale', locale);
    await loadLocaleMessages(i18n, locale);
    setI18nLanguage(i18n, locale);
  }
};

export default {
  state,
  mutations,
  actions
};
