<script setup>
import { computed, ref, inject, watch, onMounted } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import namehash from '@ensdomains/eth-ens-namehash';
import { useTxStatus } from '../composables/useTxStatus';
import { useEns } from '../composables/useEns';
import { useWeb3 } from '@/composables/useWeb3';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getAddress } from '@ethersproject/address';
import { useI18n } from '@/composables/useI18n';
import { isAddress } from '@ethersproject/address';
import { useRouter } from 'vue-router';
import {
  getSpaceUri,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps({
  ensAddress: String
});

const router = useRouter();
const { web3, web3Account } = useWeb3();
const { pendingCount } = useTxStatus();
const auth = getInstance();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { t } = useI18n();

const notify = inject('notify');

const abi = ['function setText(bytes32 node, string key, string value)'];

const spaceOwnerInput = ref('');
const settingENSRecord = ref(false);
const modalUnsupportedNetworkOpen = ref(false);
const currentTextRecord = ref('');
const loadingEnsDomains = ref(false);
const loaded = ref(false);

const networkKey = computed(() => web3.value.network.key);

const ensOwner = computed(() => {
  return ownedEnsDomains.value.map(d => d.name).includes(props.ensAddress);
});

const textRecord = computed(() => {
  const keyURI = encodeURIComponent(props.ensAddress);
  const address = web3Account.value
    ? getAddress(web3Account.value)
    : '<your-address>';
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
  if (networkKey.value !== '1') {
    modalUnsupportedNetworkOpen.value = true;
    return;
  }
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
      abi,
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

watch(
  [currentTextRecord, textRecord],
  async () => {
    loadingEnsDomains.value = true;
    try {
      console.log('loading ens');
      await loadOwnedEnsDomains();
    } catch (e) {
      console.error(e);
    } finally {
      loadingEnsDomains.value = false;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await loadSpaceUri();
  loaded.value = true;
});
</script>

<template>
  <Block v-if="!loaded || loadingEnsDomains" slim>
    <RowLoading class="my-2" />
  </Block>
  <BaseWarningBlock v-else-if="!ensOwner" class="mb-0">
    {{ $t('settings.connectWithEnsController', { ens: ensAddress }) }}
  </BaseWarningBlock>
  <template v-else>
    <BaseWarningBlock
      v-if="spaceOwnerAddress && ensOwner"
      :externalHref="`https://app.ens.domains/name/${ensAddress}`"
    >
      There is already a "snapshot" text record set for this ENS domain.
    </BaseWarningBlock>
    <Block title="Set controller">
      <!-- <div v-if="currentSpaceOwner" class="mb-3">
          <div>
            {{ $t('settings.spaceController') }}
          </div>
          <a :href="`https://app.ens.domains/name/${ensAddress}`"
            >{{ currentSpaceOwner }}
            <Icon name="external-link" />
          </a>
        </div> -->

      <UiInput
        v-if="ensOwner"
        v-model.trim="spaceOwnerInput"
        :placeholder="$t('settings.spaceOwnerAddressPlaceHolder')"
        class="mt-2"
      >
        <template v-slot:label>{{ $t('settings.controllerAddress') }}</template>
      </UiInput>

      <div>
        <div>
          <div v-if="currentTextRecord && ensOwner">
            <UiButton
              class="button-outline w-full mb-2"
              primary
              :disabled="spaceOwnerInputIsValid"
              @click="handleSetRecord"
              :loading="settingENSRecord"
            >
              {{ $t('settings.updateENS') }}
            </UiButton>
          </div>
          <div v-else-if="!currentTextRecord && ensOwner">
            <UiButton
              class="button-outline w-full mb-2"
              primary
              :disabled="spaceOwnerInputIsValid"
              @click="handleSetRecord"
              :loading="settingENSRecord"
            >
              {{ $t('settings.setENS') }}
            </UiButton>
          </div>
          <div v-if="currentTextRecord">
            <div class="w-full text-center mb-[10px] mt-1">
              {{ $t('or') }}
            </div>
            <div>
              <router-link
                :to="{
                  name: 'spaceSettings',
                  params: {
                    key: ensAddress
                  }
                }"
              >
                <UiButton no-focus class="w-full"> Go to settings </UiButton>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </Block>
  </template>
  <teleport to="#modal">
    <ModalUnsupportedNetwork
      :open="modalUnsupportedNetworkOpen"
      @close="modalUnsupportedNetworkOpen = false"
    />
  </teleport>
</template>
