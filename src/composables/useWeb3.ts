import { computed, reactive } from 'vue';
import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { formatUnits } from '@ethersproject/units';
import { getProfiles } from '@/helpers/profile';

let auth;
const defaultNetwork: any =
  import.meta.env.VITE_DEFAULT_NETWORK || Object.keys(networks)[0];

const state = reactive<{
  account: string;
  network: string;
  authLoading: boolean;
  profile: { name: string; ens: string } | null;
  walletConnectType: string | null;
  isTrezor: boolean;
}>({
  account: '',
  network: networks[defaultNetwork],
  authLoading: false,
  profile: null,
  walletConnectType: null,
  isTrezor: false
});

export function useWeb3() {
  async function login(connector = 'injected') {
    state.isTrezor = connector === 'trezor';
    auth = getInstance();
    state.authLoading = true;
    await auth.login(connector);
    if (auth.provider.value) {
      auth.web3 = new Web3Provider(auth.provider.value, 'any');
      await loadProvider();
    }
    state.authLoading = false;
  }

  function logout() {
    auth = getInstance();
    auth.logout();
    state.account = '';
    state.profile = null;
    state.isTrezor = false;
  }

  async function loadProvider() {
    try {
      if (
        auth.provider.value.removeAllListeners &&
        !auth.provider.value.isTorus
      )
        auth.provider.value.removeAllListeners();
      if (auth.provider.value.on) {
        auth.provider.value.on('chainChanged', async chainId => {
          handleChainChanged(parseInt(formatUnits(chainId, 0)));
        });
        auth.provider.value.on('accountsChanged', async accounts => {
          if (accounts.length !== 0) {
            state.account = accounts[0];
            await login();
          }
        });
        // auth.provider.on('disconnect', async () => {});
      }
      console.log('Provider', auth.provider.value);
      let network, accounts;
      try {
        const connector = auth.provider.value?.connectorName;
        if (connector === 'gnosis') {
          const { chainId: safeChainId, safeAddress } = auth.web3.provider.safe;
          network = { chainId: safeChainId };
          accounts = [safeAddress];
        } else {
          [network, accounts] = await Promise.all([
            auth.web3.getNetwork(),
            auth.web3.listAccounts()
          ]);
        }
      } catch (e) {
        console.log(e);
      }
      console.log('Network', network);
      console.log('Accounts', accounts);
      handleChainChanged(network.chainId);
      const acc = accounts.length > 0 ? accounts[0] : null;
      const profiles = await getProfiles([acc]);

      state.account = acc;
      state.walletConnectType = auth.provider.value?.wc?.peerMeta?.name || null;
      state.profile = profiles[acc];
    } catch (e) {
      state.account = '';
      state.profile = null;
      return Promise.reject(e);
    }
  }

  function handleChainChanged(chainId) {
    if (!networks[chainId]) {
      networks[chainId] = {
        ...networks[defaultNetwork],
        chainId,
        name: 'Unknown',
        network: 'unknown',
        unknown: true
      };
    }
    state.network = networks[chainId];
  }

  return {
    login,
    logout,
    loadProvider,
    handleChainChanged,
    web3: computed(() => state),
    web3Account: computed(() => state.account)
  };
}
