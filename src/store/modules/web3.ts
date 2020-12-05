import Vue from 'vue';
import { getInstance } from '@/helpers/plugins/LockPlugin';
import store from '@/store';
import config from '@/helpers/config';

let wsProvider;
let auth;

if (wsProvider) {
  wsProvider.on('block', blockNumber => {
    store.commit('GET_BLOCK_SUCCESS', blockNumber);
  });
}

const state = {
  account: {
    base16: '',
    bech32: ''
  },
  name: null,
  network: config.networks['mainnet']
};

const mutations = {
  LOGOUT(_state) {
    Vue.set(_state, 'account', null);
    Vue.set(_state, 'name', null);
    console.debug('LOGOUT');
  },
  LOAD_PROVIDER_REQUEST() {
    console.debug('LOAD_PROVIDER_REQUEST');
  },
  LOAD_PROVIDER_SUCCESS(_state, payload) {
    console.log('LOAD_PROVIDER_SUCCESS', payload);
    Vue.set(_state, 'account', payload.account);
    Vue.set(_state, 'name', payload.name);
    console.debug('LOAD_PROVIDER_SUCCESS');
  },
  LOAD_PROVIDER_FAILURE(_state, payload) {
    Vue.set(_state, 'account', null);
    console.debug('LOAD_PROVIDER_FAILURE', payload);
  },
  HANDLE_CHAIN_CHANGED(_state, net) {
    if (net) {
      config.networks[net] = {
        ...config.networks[net],
        net,
        chainId: 0,
        name: net,
        network: net
      };
    }
    Vue.set(_state, 'network', config.networks[net]);
    console.debug('HANDLE_CHAIN_CHANGED', net);
  },
  HANDLE_ACCOUNTS_CHANGED(_state, payload) {
    Vue.set(_state, 'account', payload);
    console.debug('HANDLE_ACCOUNTS_CHANGED', payload);
  }
};

const actions = {
  login: async ({ dispatch }, connector = 'injected') => {
    auth = getInstance();
    await auth.login(connector);

    if (auth.provider) {
      auth.web3 = auth.provider;
      await dispatch('loadProvider');
    }
  },
  logout: async ({ commit }) => {
    Vue.prototype.$auth.logout();
    commit('LOGOUT');
  },
  loadProvider: async ({ commit }) => {
    commit('LOAD_PROVIDER_REQUEST');
    try {
      if (auth.provider) {
        auth.provider.wallet
          .observableAccount()
          .subscribe(async (account: any) => {
            commit('HANDLE_ACCOUNTS_CHANGED', account);
          });
        auth.provider.wallet.observableNetwork().subscribe((net: string) => {
          commit('HANDLE_CHAIN_CHANGED', net);
        });
      }
      const net = auth.provider.wallet.net;
      commit('HANDLE_CHAIN_CHANGED', net);
      const account = auth.provider.wallet.defaultAccount;
      const name = auth.provider.wallet.defaultAccount.bech32;
      commit('LOAD_PROVIDER_SUCCESS', {
        account,
        name
      });
    } catch (e) {
      commit('LOAD_PROVIDER_FAILURE', e);
      return Promise.reject();
    }
  }
};

export default {
  state,
  mutations,
  actions
};
