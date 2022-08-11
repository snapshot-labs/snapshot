import { computed, reactive } from 'vue';
import { Web3Provider } from '@ethersproject/providers';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { formatUnits } from '@ethersproject/units';

let auth;
const defaultNetwork: any =
  import.meta.env.VITE_DEFAULT_NETWORK || Object.keys(networks)[0];

const state = reactive<{
  account: string;
  network: Record<string, any>;
  authLoading: boolean;
  walletConnectType: string | null;
}>({
  account: '',
  network: networks[defaultNetwork],
  authLoading: false,
  walletConnectType: null
});

export function useWeb3() {
  async function login(connector = 'injected') {
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

      state.account = acc;
      state.walletConnectType = auth.provider.value?.wc?.peerMeta?.name || null;
    } catch (e) {
      state.account = '';
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

  const ensureRightNetwork = async chainId => {
    const chainIdInt = parseInt(chainId);
    const connectedToChainId = getInstance().provider.value?.chainId;
    if (connectedToChainId === chainIdInt) return; // already on right chain

    if (!window.ethereum || !getInstance().provider.value?.isMetaMask) {
      // we cannot switch automatically
      throw new Error(
        `Connected to wrong chain #${connectedToChainId}, required: #${chainId}`
      );
    }

    const network = networks[chainId];
    const chainIdHex = `0x${chainIdInt.toString(16)}`;

    try {
      // check if the chain to connect to is installed
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }] // chainId must be in hexadecimal numbers
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask. Let's add it.
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: network.name,
                rpcUrls: network.rpc,
                blockExplorerUrls: [network.explorer]
              }
            ]
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }

    await sleep(1e3); // somehow the switch does not take immediate effect :/
    if (window.ethereum.chainId !== chainIdHex) {
      throw new Error(
        `Could not switch to the right chain on MetaMask (required: ${chainIdHex}, active: ${window.ethereum.chainId})`
      );
    }
  };

  return {
    login,
    logout,
    loadProvider,
    handleChainChanged,
    ensureRightNetwork,
    web3: computed(() => state),
    web3Account: computed(() => state.account)
  };
}
