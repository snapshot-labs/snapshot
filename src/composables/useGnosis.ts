import { computed } from 'vue';
import { useWeb3 } from '@/composables';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ExtendedSpace } from '@/helpers/interfaces';

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

export function useGnosis(space?: ExtendedSpace) {
  const { web3 } = useWeb3();

  const auth = getInstance();
  const connectorName = computed(() => auth.provider.value?.connectorName);

  const isGnosisSafe = computed(
    () =>
      web3.value?.walletConnectType === 'Gnosis Safe Multisig' ||
      connectorName.value === 'gnosis'
  );

  const networkKey = computed(() => web3.value.network.key);

  const spaceNetworkKey = computed(() => space?.network);

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
