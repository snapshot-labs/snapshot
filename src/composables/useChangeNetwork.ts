import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

const NETWORKS = {
  '1': {
    name: 'Ethereum Mainnet',
    chainId: '0x1'
  },
  '5': {
    name: 'Goerli Testnet',
    chainId: '0x5'
  },
  '11155111': {
    name: 'Sepolia Testnet',
    chainId: '0xaa36a7'
  }
};

export function useChangeNetwork() {
  const changingNetwork = ref(false);

  async function changeNetwork(network: string) {
    changingNetwork.value = true;
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: NETWORKS[network].chainId
        }
      ]
    });
    await sleep(1000);
    changingNetwork.value = false;
  }

  return {
    NETWORKS,
    changingNetwork,
    changeNetwork
  };
}
