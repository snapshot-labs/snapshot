import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { hexlify } from '@ethersproject/bytes';

export function useChangeNetwork() {
  const changingNetwork = ref(false);

  async function changeNetwork(network: string) {
    changingNetwork.value = true;
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: hexlify(Number(networks[network].chainId))
        }
      ]
    });
    await sleep(1000);
    changingNetwork.value = false;
  }

  return {
    changingNetwork,
    changeNetwork
  };
}
