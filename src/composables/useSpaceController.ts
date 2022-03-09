import { computed, ref, inject } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import namehash from '@ensdomains/eth-ens-namehash';
import { useTxStatus } from '../composables/useTxStatus';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getAddress } from '@ethersproject/address';
import { useI18n } from '@/composables/useI18n';
import { useWeb3 } from '@/composables/useWeb3';
import { isAddress } from '@ethersproject/address';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';

const ensAddress = ref('');
const spaceControllerInput = ref('');
const modalUnsupportedNetworkOpen = ref(false);
const modalConfirmSetTextRecordOpen = ref(false);
const settingENSRecord = ref(false);

export function useSpaceController() {
  const { web3 } = useWeb3();
  const { pendingCount } = useTxStatus();
  const auth = getInstance();
  const { t } = useI18n();

  const notify: any = inject('notify');

  const ensAbi = ['function setText(bytes32 node, string key, string value)'];

  const controllerInputIsValid = computed(() =>
    isAddress(spaceControllerInput.value)
  );

  const networkKey = computed(() => web3.value.network.key);

  const textRecord = computed(() => {
    const keyURI = encodeURIComponent(ensAddress.value);
    const address = spaceControllerInput.value
      ? getAddress(spaceControllerInput.value)
      : null;
    return `ipns://storage.snapshot.page/registry/${address}/${keyURI}`;
  });

  async function setRecord() {
    settingENSRecord.value = true;
    try {
      const ensPublicResolverAddress = networks[networkKey.value].ensResolver;
      if (!ensPublicResolverAddress) {
        throw new Error('No ENS resolver address for this network');
      }
      const ensname = ensAddress.value;
      const node = namehash.hash(ensname);
      const tx = await sendTransaction(
        auth.web3,
        ensPublicResolverAddress,
        ensAbi,
        'setText',
        [node, 'snapshot', textRecord.value]
      );
      settingENSRecord.value = false;
      pendingCount.value++;
      const receipt = await tx.wait();
      pendingCount.value--;
      notify(t('notify.ensSet'));
      console.log('Receipt', receipt);
      return receipt;
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      settingENSRecord.value = false;
    }
  }

  function confirmSetRecord() {
    if (networkKey.value !== import.meta.env.VITE_DEFAULT_NETWORK)
      modalUnsupportedNetworkOpen.value = true;
    else modalConfirmSetTextRecordOpen.value = true;
  }

  return {
    spaceControllerInput,
    controllerInputIsValid,
    settingENSRecord,
    ensAddress,
    modalUnsupportedNetworkOpen,
    modalConfirmSetTextRecordOpen,
    setRecord,
    confirmSetRecord
  };
}
