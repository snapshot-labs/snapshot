import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { formatUnits } from '@ethersproject/units';
import { getProfiles } from '@/helpers/profile';

let auth;
const defaultNetwork: any =
  import.meta.env.VITE_DEFAULT_NETWORK || Object.keys(networks)[0];

const state = {
  account: null,
  name: null,
  network: networks[defaultNetwork]
};

const mutations = {
  HANDLE_CHAIN_CHANGED(_state, chainId) {
    if (!networks[chainId]) {
      networks[chainId] = {
        ...networks[defaultNetwork],
        chainId,
        name: 'Unknown',
        network: 'unknown',
        unknown: true
      };
    }
    _state.network = networks[chainId];
    console.debug('HANDLE_CHAIN_CHANGED', chainId);
  },
  WEB3_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  }
};

const actions = {
  login: async ({ dispatch, commit }, connector = 'injected') => {
    auth = getInstance();
    commit('SET', { authLoading: true });
    await auth.login(connector);
    if (auth.provider.value) {
      auth.web3 = new Web3Provider(auth.provider.value);
      await dispatch('loadProvider');
    }
    commit('SET', { authLoading: false });
  },
  logout: async ({ commit }) => {
    auth = getInstance();
    auth.logout();
    commit('WEB3_SET', { account: null, profile: null });
  },
  loadProvider: async ({ commit, dispatch }) => {
    try {
      if (
        auth.provider.value.removeAllListeners &&
        !auth.provider.value.isTorus
      )
        auth.provider.value.removeAllListeners();
      if (auth.provider.value.on) {
        auth.provider.value.on('chainChanged', async chainId => {
          commit('HANDLE_CHAIN_CHANGED', parseInt(formatUnits(chainId, 0)));
        });
        auth.provider.value.on('accountsChanged', async accounts => {
          if (accounts.length !== 0) {
            commit('WEB3_SET', { account: accounts[0] });
            await dispatch('login');
          }
        });
        // auth.provider.on('disconnect', async () => {});
      }
      console.log('Provider', auth.provider.value);
      let network, accounts;
      try {
        [network, accounts] = await Promise.all([
          auth.web3.getNetwork(),
          auth.web3.listAccounts()
        ]);
      } catch (e) {
        console.log(e);
      }
      console.log('Network', network);
      console.log('Accounts', accounts);
      commit('HANDLE_CHAIN_CHANGED', network.chainId);
      const account = accounts.length > 0 ? accounts[0] : null;
      const profiles = await getProfiles([account]);
      commit('WEB3_SET', {
        account,
        walletConnectType: auth.provider.value?.wc?.peerMeta?.name || 'unknown',
        profile: profiles[account]
      });
    } catch (e) {
      commit('WEB3_SET', { account: null, profile: null });
      return Promise.reject(e);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
