import namehash from '@ensdomains/eth-ens-namehash';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getAddress } from '@ethersproject/address';
import {
  sendTransaction,
  getEnsOwner,
  getSpaceController
} from '@snapshot-labs/snapshot.js/src/utils';

const spaceControllerInput = ref('');
const modalUnsupportedNetworkOpen = ref(false);
const modalConfirmSetTextRecordOpen = ref(false);
const settingENSRecord = ref(false);
const pendingENSRecord = ref(false);
const ensOwner = ref<string | null>(null);
const spaceController = ref<string | null>(null);
const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;
const broviderUrl = import.meta.env.VITE_BROVIDER_URL;

export function useSpaceController() {
  const { web3Account, chain, web3ProviderRef } = useWeb3();
  const { t } = useI18n();
  const route = useRoute();
  const { domain } = useApp();
  const { notify } = useFlashNotification();

  const ensAbi = ['function setText(bytes32 node, string key, string value)'];

  const networkKey = computed(() => chain.value.id.toString());

  const ensAddress = computed(
    () => domain || route.params.ens || route.params.key
  );

  const isEnsOwner = computed(
    () => ensOwner.value?.toLowerCase() === web3Account.value?.toLowerCase()
  );

  const isSpaceController = computed(
    () =>
      spaceController.value?.toLowerCase() === web3Account.value?.toLowerCase()
  );

  async function setRecord() {
    settingENSRecord.value = true;
    try {
      const ensResolvers = networks[networkKey.value].ensResolvers;
      const ensPublicResolverAddress = ensResolvers[0];
      if (!ensPublicResolverAddress) {
        throw new Error('No ENS resolver address for this network');
      }
      const ensname = ensAddress.value;
      const node = namehash.hash(ensname);
      const tx = await sendTransaction(
        web3ProviderRef.value,
        ensPublicResolverAddress,
        ensAbi,
        'setText',
        [node, 'snapshot', getAddress(spaceControllerInput.value)]
      );
      settingENSRecord.value = false;
      notify(t('notify.transactionSent'));

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

  async function loadEnsOwner() {
    ensOwner.value = await getEnsOwner(ensAddress.value, defaultNetwork, {
      broviderUrl
    });
  }

  async function loadSpaceController() {
    spaceController.value = await getSpaceController(
      ensAddress.value,
      defaultNetwork,
      { broviderUrl }
    );
  }

  return {
    spaceControllerInput,
    settingENSRecord,
    pendingENSRecord,
    modalUnsupportedNetworkOpen,
    modalConfirmSetTextRecordOpen,
    setRecord,
    confirmSetRecord,
    ensAddress,
    loadEnsOwner,
    ensOwner,
    isEnsOwner,
    loadSpaceController,
    spaceController,
    isSpaceController
  };
}
