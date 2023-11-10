import { useAccount, useConnect, useDisconnect, useNetwork } from 'use-wagmi';
import { Web3Provider } from '@ethersproject/providers';
import { mainnet, goerli } from 'viem/chains';
import { Config } from 'use-wagmi';

const defaultChainId: any = import.meta.env.VITE_DEFAULT_NETWORK;

const web3ProviderRef = ref<any>(null);
const providerRef = ref<any>(null);

export function useWeb3() {
  const { notify } = useFlashNotification();

  const { connect } = useConnect({
    onSuccess({ connector }) {
      initProviders(connector);
    },
    onError(e) {
      notify(['red', e.message]);
    }
  });
  const { disconnect } = useDisconnect();
  const { address, isConnected, isConnecting } = useAccount({
    // onConnect({ connector }) {
    //   connector?.getProvider();
    // }
  });
  const { chain } = useNetwork();

  const defaultChain = computed(() =>
    defaultChainId === '1' ? mainnet : goerli
  );

  async function initProviders(connector: Config['connector']) {
    if (connector?.getProvider) {
      providerRef.value = await connector.getProvider();
      web3ProviderRef.value = new Web3Provider(await connector.getProvider());
    } else {
      providerRef.value = null;
      web3ProviderRef.value = null;
    }
  }

  return {
    connect,
    disconnect,
    chain: computed(() => chain?.value ?? defaultChain.value),
    web3Account: computed(() => address.value ?? ''),
    isConnected,
    isConnecting,
    web3ProviderRef,
    providerRef
  };
}
