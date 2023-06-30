import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ExtendedSpace } from '@/helpers/interfaces';
import utils from '@snapshot-labs/snapshot.js/src/utils';
import { computedAsync } from '@vueuse/core';

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

export function useGnosis(space?: ExtendedSpace) {
  const { web3 } = useWeb3();

  const auth = getInstance();
  const connectorName = computed(() => auth.provider.value?.connectorName);

  const networkKey = computed(() => web3.value.network.key);

  const spaceNetworkKey = computed(() => space?.network);

  const isContract = computedAsync(async () => {
    if (!web3.value.account) return false;
    const provider = utils.getProvider(networkKey.value);
    const code = await provider.getCode(web3.value.account);
    return code !== '0x';
  }, false);

  const isGnosisSafe = computed(
    () =>
      web3.value?.walletConnectType === 'Gnosis Safe Multisig' ||
      web3.value?.walletConnectType === 'WalletConnect Safe App' ||
      web3.value?.walletConnectType === 'Den' ||
      connectorName.value === 'gnosis' ||
      isContract.value
  );

  const isGnosisAndNotDefaultNetwork = computed(() => {
    return isGnosisSafe.value && networkKey.value !== defaultNetwork;
  });

  const isGnosisAndNotSpaceNetwork = computed(() => {
    return isGnosisSafe.value && networkKey.value !== spaceNetworkKey.value;
  });

  return {
    isGnosisSafe,
    isGnosisAndNotDefaultNetwork,
    isGnosisAndNotSpaceNetwork
  };
}
