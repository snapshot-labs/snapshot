import { computed, ref, inject, onMounted } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import namehash from '@ensdomains/eth-ens-namehash';
import { useTxStatus } from '../composables/useTxStatus';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getAddress } from '@ethersproject/address';
import { useI18n } from '@/composables/useI18n';
import { useWeb3 } from '@/composables/useWeb3';
import { isAddress } from '@ethersproject/address';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { useRoute, useRouter } from 'vue-router';
import { getSpaceUri } from '@snapshot-labs/snapshot.js/src/utils';
import { useApp } from '@/composables/useApp';

const spaceControllerInput = ref('');
const modalUnsupportedNetworkOpen = ref(false);
const modalConfirmSetTextRecordOpen = ref(false);
const settingENSRecord = ref(false);
const pendingENSRecord = ref(false);
const uriAddress = ref('');
const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

export function useSpaceController() {
  const { web3 } = useWeb3();
  const { pendingCount } = useTxStatus();
  const auth = getInstance();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const { domain } = useApp();

  const notify: any = inject('notify');

  const ensAbi = ['function setText(bytes32 node, string key, string value)'];

  const controllerInputIsValid = computed(() =>
    isAddress(spaceControllerInput.value)
  );

  const networkKey = computed(() => web3.value.network.key);

  const ensAddress = computed(
    () => domain || route.params.ens || route.params.key
  );

  const textRecord = computed(() => {
    const keyURI = encodeURIComponent(ensAddress.value as string);
    const address = spaceControllerInput.value
      ? getAddress(spaceControllerInput.value)
      : null;
    const registryNetworkPath = defaultNetwork === '1' ? '' : 'testnet/';
    return `ipns://storage.snapshot.page/registry/${registryNetworkPath}${address}/${keyURI}`;
  });

  async function waitForSetRecord(tx) {
    pendingENSRecord.value = true;
    pendingCount.value++;
    const receipt = await tx.wait();
    await loadUriAddress();
    pendingCount.value--;
    pendingENSRecord.value = false;
    notify(t('notify.ensSet'));
    console.log('Receipt', receipt);
    return receipt;
  }

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
      notify(t('notify.transactionSent'));
      waitForSetRecord(tx);
      return tx;
    } catch (e) {
      notify(['red', t('notify.somethingWentWrong')]);
      console.log(e);
    } finally {
      settingENSRecord.value = false;
    }
  }

  function confirmSetRecord() {
    if (networkKey.value !== defaultNetwork)
      modalUnsupportedNetworkOpen.value = true;
    else modalConfirmSetTextRecordOpen.value = true;
  }

  async function loadUriAddress() {
    const uri = await getSpaceUri(ensAddress.value, defaultNetwork);
    console.log('URI', uri);
    const uriArray = uri?.split('/') ?? [];
    if (defaultNetwork === '1') {
      return (uriAddress.value = uriArray[4] ?? '');
    }
    if (uriArray[4] === 'testnet') {
      return (uriAddress.value = uriArray[5] ?? '');
    }
  }

  // Checks if a text-record with the connected wallet address exists
  // and skips to step 3 if it does
  const loadingTextRecord = ref(false);
  onMounted(async () => {
    try {
      loadingTextRecord.value = true;
      await loadUriAddress();
      loadingTextRecord.value = false;
    } catch (e) {
      console.log(e);
      loadingTextRecord.value = false;
    }
  });

  return {
    spaceControllerInput,
    controllerInputIsValid,
    settingENSRecord,
    pendingENSRecord,
    modalUnsupportedNetworkOpen,
    modalConfirmSetTextRecordOpen,
    uriAddress,
    loadingTextRecord,
    setRecord,
    confirmSetRecord,
    loadUriAddress,
    ensAddress,
    textRecord
  };
}
