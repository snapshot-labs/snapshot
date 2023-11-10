import { useEns } from './useEns';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { contractAddress } from '@/helpers/delegation';
import { formatBytes32String } from '@ethersproject/strings';
import {
  sendTransaction,
  sleep,
  SNAPSHOT_SUBGRAPH_URL
} from '@snapshot-labs/snapshot.js/src/utils';

export function useDelegate() {
  const abi = ['function setDelegate(bytes32 id, address delegate)'];

  const { notify } = useFlashNotification();
  const {
    createPendingTransaction,
    updatePendingTransaction,
    removePendingTransaction
  } = useTxStatus();
  const { validEnsTlds } = useEns();
  const { t } = useI18n();
  const { web3ProviderRef, chain } = useWeb3();

  const loading = ref(false);

  const networkKey = computed(() => chain?.value?.id);

  const networkSupportsDelegate = computed(
    () => SNAPSHOT_SUBGRAPH_URL[networkKey.value] !== undefined
  );

  async function delegateTo(address, spaceId = '') {
    loading.value = true;
    const txPendingId = createPendingTransaction();
    try {
      let ethAddress = address;
      if (validEnsTlds.includes(address.split('.').pop())) {
        const networkId = import.meta.env.VITE_DEFAULT_NETWORK;
        const broviderUrl = import.meta.env.VITE_BROVIDER_URL;
        const provider = getProvider(networkId, { broviderUrl });
        ethAddress = await provider.resolveName(address);
      }
      const tx = await sendTransaction(
        web3ProviderRef.value,
        contractAddress,
        abi,
        'setDelegate',
        [formatBytes32String(spaceId), ethAddress]
      );
      notify(t('notify.transactionSent'));
      updatePendingTransaction(txPendingId, { hash: tx.hash });
      loading.value = false;
      const receipt = await tx.wait();
      console.log('Receipt', receipt);
      await sleep(3e3);
      notify(t('notify.delegationSuccess'));
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      loading.value = false;
      removePendingTransaction(txPendingId);
    }
  }

  return {
    delegateTo,
    delegationLoading: computed(() => loading.value),
    networkSupportsDelegate,
    networkKey
  };
}
