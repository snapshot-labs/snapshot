import { computed, inject, ref } from 'vue';
import { useEns } from './useEns';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { contractAddress } from '@/helpers/delegation';
import { formatBytes32String } from '@ethersproject/strings';
import { sendTransaction, sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useTxStatus } from '@/composables/useTxStatus';
import { useI18n } from '@/composables/useI18n';
import { SNAPSHOT_SUBGRAPH_URL } from '@snapshot-labs/snapshot.js/src/utils';
import { useWeb3 } from '@/composables/useWeb3';

export function useDelegate() {
  const abi = ['function setDelegate(bytes32 id, address delegate)'];

  const auth = getInstance();
  const notify: any = inject('notify');
  const { pendingCount } = useTxStatus();
  const { validEnsTlds } = useEns();
  const { t } = useI18n();
  const { web3 } = useWeb3();

  const loading = ref(false);

  const networkKey = computed(() => web3.value.network.key);

  const networkSupportsDelegate = computed(
    () => SNAPSHOT_SUBGRAPH_URL[networkKey.value] !== undefined
  );

  async function delegateTo(address, spaceId = '') {
    loading.value = true;

    try {
      let ethAddress = address;
      if (validEnsTlds.includes(address.split('.').pop()))
        ethAddress = await getProvider('1', 'brovider').resolveName(address);
      const tx = await sendTransaction(
        auth.web3,
        contractAddress,
        abi,
        'setDelegate',
        [formatBytes32String(spaceId), ethAddress]
      );
      notify(t('notify.transactionSent'));
      pendingCount.value++;
      loading.value = false;
      const receipt = await tx.wait();
      console.log('Receipt', receipt);
      await sleep(3e3);
      notify(t('notify.delegationSuccess'));
      pendingCount.value--;
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      pendingCount.value--;
      console.log(e);
    } finally {
      loading.value = false;
    }
  }

  return {
    delegateTo,
    delegationLoading: computed(() => loading.value),
    networkSupportsDelegate,
    networkKey
  };
}
