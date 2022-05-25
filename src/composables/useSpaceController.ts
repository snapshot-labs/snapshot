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

const spaceControllerInput = ref('');
const modalUnsupportedNetworkOpen = ref(false);
const modalConfirmSetTextRecordOpen = ref(false);
const settingENSRecord = ref(false);
const pendingENSRecord = ref(false);
const uriAddress = ref('');

export function useSpaceController() {
  const { web3 } = useWeb3();
  const { pendingCount } = useTxStatus();
  const auth = getInstance();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  const notify: any = inject('notify');

  const ensAbi = ['function setText(bytes32 node, string key, string value)'];

  const controllerInputIsValid = computed(() =>
    isAddress(spaceControllerInput.value)
  );

  const networkKey = computed(() => web3.value.network.key);

  const textRecord = computed(() => {
    const keyURI = encodeURIComponent(route.params.ens as string);
    const address = spaceControllerInput.value
      ? getAddress(spaceControllerInput.value)
      : null;
    return `ipns://storage.snapshot.page/registry/${address}/${keyURI}`;
  });

  async function waitForSetRecord(tx) {
    pendingENSRecord.value = true;
    pendingCount.value++;
    const receipt = await tx.wait();
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
      const ensname = route.params.ens;
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
    if (networkKey.value !== import.meta.env.VITE_DEFAULT_NETWORK)
      modalUnsupportedNetworkOpen.value = true;
    else modalConfirmSetTextRecordOpen.value = true;
  }

  async function loadUriAddress() {
    const uri = await getSpaceUri(
      route.params.ens,
      import.meta.env.VITE_DEFAULT_NETWORK
    );
    console.log('URI', uri);
    uriAddress.value = uri?.split('/')[4] ?? '';
  }

  // Checks if a text-record with the connected wallet address exists
  // and skips to step 3 if it does
  const loadingTextRecord = ref(false);
  onMounted(async () => {
    if (!route.params.step) return;
    try {
      loadingTextRecord.value = true;
      await loadUriAddress();
      if (uriAddress.value && route.params.step === 'controller') {
        router.push({
          name: 'setup',
          params: { step: 'profile', ens: route.params.ens }
        });
      }
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
    loadUriAddress
  };
}
