import { useAccount, useConnect, useDisconnect, useNetwork } from 'use-wagmi';
import { InjectedConnector } from 'use-wagmi/connectors/injected';
import { Web3Provider } from '@ethersproject/providers';
import { mainnet, goerli } from 'viem/chains';

const defaultChainId: any = import.meta.env.VITE_DEFAULT_NETWORK;

const web3ProviderRef = ref<any>(null);
const providerRef = ref<any>(null);

export function useWeb3() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
    onSuccess(connector) {
      initProviders(connector.connector);
    }
  });
  const { disconnect } = useDisconnect();
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();

  const defaultChain = computed(() =>
    defaultChainId === '1' ? mainnet : goerli
  );

  async function initProviders(connector) {
    if (isConnected.value && connector?.getProvider) {
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
