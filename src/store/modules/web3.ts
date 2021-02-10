import networks from '@/helpers/networks.json';
import store from '@/store';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { Web3Provider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { getProfiles } from '@/helpers/profile';

let wsProvider;
let auth;
const defaultNetwork =
  process.env.VUE_APP_DEFAULT_NETWORK || Object.keys(networks)[0];

if (wsProvider) {
  wsProvider.on('block', blockNumber => {
    store.commit('GET_BLOCK_SUCCESS', blockNumber);
  });
}

const state = {
  account: null,
  name: null,
  network: networks[defaultNetwork],
  profile: '',
  connectorId: ''
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
  initSession: async ({ dispatch, commit }) => {
    commit('SET', { authLoading: true });

    try {
      const session: any = localStorage.getItem('harmony_session');

      const sessionObj = JSON.parse(session);

      if (
        sessionObj &&
        sessionObj.connectorId === 'harmony' &&
        sessionObj.account
      ) {
        commit('WEB3_SET', { connectorId: sessionObj.connectorId });

        await dispatch('loadProvider', {
          address: sessionObj.account,
          name: sessionObj.name,
          connector: sessionObj.connectorId
        });

        auth = getInstance();
        auth.isAuthenticated.value = true;
      } else {
        auth = getInstance();
        const connector = await auth.getConnector();
        if (connector) dispatch('login', 'metamask');
      }
    } catch (e) {
      console.error(e);
    }

    commit('SET', { authLoading: false });
  },

  syncLocalStorage: () => {
    return localStorage.setItem(
      'harmony_session',
      JSON.stringify({
        account: state.account,
        name: state.name,
        network: state.network,
        profile: state.profile,
        connectorId: state.connectorId
      })
    );
  },

  login: async ({ dispatch, commit }, connector) => {
    commit('SET', { authLoading: true });

    commit('WEB3_SET', { connectorId: connector });

    try {
      if (connector === 'metamask') {
        auth = getInstance();
        await auth.login('injected');
        if (auth.provider.value) {
          auth.web3 = new Web3Provider(auth.provider.value);
          await dispatch('loadProvider');
        }
      }

      if (connector === 'harmony') {
        // @ts-ignore
        const account = await window.onewallet.getAccount();
        if (account && account.address) {
          await dispatch('loadProvider', { ...account, connector });
          await dispatch('syncLocalStorage');
          auth = getInstance();
          auth.isAuthenticated.value = true;
        }
      }
    } catch (e) {
      console.error(e);
    }

    commit('SET', { authLoading: false });
  },
  logout: async ({ commit, dispatch }) => {
    if (state.connectorId === 'harmony') {
      // @ts-ignore
      window.onewallet.forgetIdentity();
    }

    auth = getInstance();
    auth.logout();
    auth.isAuthenticated.value = false;
    commit('WEB3_SET', { account: null, profile: null, connectorId: '' });
    await dispatch('syncLocalStorage');
  },
  loadProvider: async ({ commit, dispatch }, accountBase) => {
    try {
      if (accountBase && accountBase.connector === 'harmony') {
        commit('HANDLE_CHAIN_CHANGED', 0);
        // const account = 'one1c4w9danpa5v9zqurnl07lkqdcwyn3yfm86anqu';
        const account = accountBase.address;
        const profiles = await getProfiles([account]);
        commit('WEB3_SET', {
          account,
          name: accountBase.name,
          profile: profiles[account]
        });
      } else {
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
              await dispatch('loadProvider');
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
          profile: profiles[account]
        });
      }
    } catch (e) {
      console.error(e);
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
