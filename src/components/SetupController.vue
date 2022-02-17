<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import namehash from '@ensdomains/eth-ens-namehash';
import { useTxStatus } from '../composables/useTxStatus';
import { useWeb3 } from '@/composables/useWeb3';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getAddress } from '@ethersproject/address';
import { useI18n } from '@/composables/useI18n';
import { isAddress } from '@ethersproject/address';
import { shorten } from '@/helpers/utils';
import { useRouter } from 'vue-router';
import {
  getSpaceUri,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  ensAddress: string;
  ownedEnsDomains: { name: string }[];
}>();

const router = useRouter();
const { web3 } = useWeb3();
const { pendingCount } = useTxStatus();
const auth = getInstance();
const { t } = useI18n();

const notify: any = inject('notify');

const ensAbi = ['function setText(bytes32 node, string key, string value)'];

const spaceOwnerInput = ref('');
const settingENSRecord = ref(false);
const modalUnsupportedNetworkOpen = ref(false);
const currentTextRecord = ref('');
const loaded = ref(false);
const modalConfirmSetTextRecordOpen = ref(false);

const networkKey = computed(() => web3.value.network.key);

const ensOwner = computed(() => {
  return props.ownedEnsDomains.map(d => d.name).includes(props.ensAddress);
});

const textRecord = computed(() => {
  const keyURI = encodeURIComponent(props.ensAddress);
  const address = spaceOwnerInput.value
    ? getAddress(spaceOwnerInput.value)
    : null;
  return `ipns://storage.snapshot.page/registry/${address}/${keyURI}`;
});

const spaceOwnerAddress = computed(() => {
  return currentTextRecord.value?.split('/')[4] ?? '';
});

const spaceOwnerInputIsValid = computed(
  () =>
    spaceOwnerInput.value === '' ||
    spaceOwnerInput.value === spaceOwnerAddress.value ||
    !isAddress(spaceOwnerInput.value)
);

async function loadSpaceUri() {
  try {
    const uri = await getSpaceUri(
      props.ensAddress,
      import.meta.env.VITE_DEFAULT_NETWORK
    );
    console.log('URI', uri);
    currentTextRecord.value = uri;
  } catch (e) {
    console.log(e);
  }
}

async function handleSetRecord() {
  settingENSRecord.value = true;
  try {
    const ensPublicResolverAddress = networks[networkKey.value].ensResolver;
    if (!ensPublicResolverAddress) {
      throw new Error('No ENS resolver address for this network');
    }
    const ensname = props.ensAddress;
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
    console.log('Receipt', receipt);
    router.push({
      name: 'spaceSettings',
      params: {
        key: props.ensAddress
      }
    });
    notify(t('notify.ensSet'));
  } catch (e) {
    notify(['red', t('notify.somethingWentWrong')]);
    console.log(e);
  } finally {
    pendingCount.value--;
    settingENSRecord.value = false;
  }
}

function clickSetRecord() {
  if (networkKey.value !== import.meta.env.VITE_DEFAULT_NETWORK)
    modalUnsupportedNetworkOpen.value = true;
  else modalConfirmSetTextRecordOpen.value = true;
}

onMounted(async () => {
  await loadSpaceUri();
  loaded.value = true;
});
</script>

<template>
  <Block v-if="!loaded" slim>
    <RowLoading class="my-2" />
  </Block>
  <BaseMessageBlock level="warning" v-else-if="!ensOwner" class="mb-0">
    {{ $t('setup.connectWithEnsController', { ens: ensAddress }) }}
  </BaseMessageBlock>
  <template v-else>
    <BaseMessageBlock v-if="spaceOwnerAddress && ensOwner" level="info">
      {{
        $t('setup.textRecordExists', { address: shorten(spaceOwnerAddress) })
      }}
      <div>
        <BaseAnchor :link="`https://app.ens.domains/name/${ensAddress}`">
          {{ $t('setup.seeOnEns') }}
        </BaseAnchor>
      </div>
    </BaseMessageBlock>
    <Block
      :title="
        currentTextRecord
          ? $t('setup.editSpaceController')
          : $t('setup.setSpaceController')
      "
    >
      <UiInput
        v-if="ensOwner"
        v-model.trim="spaceOwnerInput"
        :placeholder="$t('setup.spaceOwnerAddressPlaceHolder')"
        class="mt-2"
        focus-on-mount
      >
        <template v-slot:label>{{ $t('setup.controllerAddress') }}</template>
      </UiInput>

      <div>
        <div>
          <div v-if="currentTextRecord && ensOwner">
            <UiButton
              class="button-outline w-full mb-2"
              primary
              :disabled="spaceOwnerInputIsValid"
              @click="clickSetRecord"
              :loading="settingENSRecord"
            >
              {{ $t('setup.updateENS') }}
            </UiButton>
          </div>
          <div v-else-if="!currentTextRecord && ensOwner">
            <UiButton
              class="button-outline w-full mb-2"
              primary
              :disabled="spaceOwnerInputIsValid"
              @click="clickSetRecord"
              :loading="settingENSRecord"
            >
              {{ $t('setup.setController') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Block>
  </template>
  <teleport to="#modal">
    <ModalUnsupportedNetwork
      :open="modalUnsupportedNetworkOpen"
      @close="modalUnsupportedNetworkOpen = false"
      @setTextrecord="modalConfirmSetTextRecordOpen = true"
    />
    <ModalConfirmAction
      :open="modalConfirmSetTextRecordOpen"
      @close="modalConfirmSetTextRecordOpen = false"
      @confirm="handleSetRecord"
    >
      <div class="space-y-4 m-4 text-skin-link">
        <p>
          {{ $t('setup.explainControllerAndEns') }}
        </p>
        <p>
          {{
            $t('setup.confirmToSetAddress', {
              address: shorten(spaceOwnerInput)
            })
          }}
          {{ $t('setup.controllerHasAuthority') + '.' }}
        </p>
      </div>
    </ModalConfirmAction>
  </teleport>
</template>
