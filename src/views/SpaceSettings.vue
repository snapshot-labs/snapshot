<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { getAddress } from '@ethersproject/address';
import { shorten, clearStampCache } from '@/helpers/utils';
import { getSpaceUri, clone } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace } from '@/helpers/interfaces';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

import {
  useI18n,
  useWeb3,
  useClient,
  useSpaceController,
  useEns,
  useExtendedSpaces,
  useSpaceForm,
  useTreasury,
  useFlashNotification
} from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  sourceSpace: ExtendedSpace;
}>();

const { t, setPageTitle } = useI18n();
const { web3Account } = useWeb3();
const { send, isSending } = useClient();
const { reloadSpace } = useExtendedSpaces();
const { form, validationResult, isValid, isReadyToSubmit, formatSpace } =
  useSpaceForm('settings');
const { resetTreasuryAssets } = useTreasury();
const { notify } = useFlashNotification();

const currentSettings = ref({});
const currentTextRecord = ref('');
const loaded = ref(false);

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const textRecord = computed(() => {
  const keyURI = encodeURIComponent(props.space.id);
  const address = web3Account.value
    ? getAddress(web3Account.value)
    : '<your-address>';
  const registryNetworkPath = defaultNetwork === '1' ? '' : 'testnet/';
  return `ipns://storage.snapshot.page/registry/${registryNetworkPath}${address}/${keyURI}`;
});

const isSpaceController = computed(() => {
  return currentTextRecord.value === textRecord.value;
});

const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();

watch(
  [currentTextRecord, textRecord],
  async () => {
    loadOwnedEnsDomains();
  },
  { immediate: true }
);

const ensOwner = computed(() =>
  ownedEnsDomains.value?.map(d => d.name).includes(props.space.id)
);

const isSpaceAdmin = computed(() => {
  if (!props.space || !currentTextRecord.value) return false;
  const admins = (props.space?.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});

async function handleSubmit() {
  if (!isValid.value)
    return console.log('Invalid schema', validationResult.value);

  const formattedForm = formatSpace(form.value);
  const result = await send({ id: props.space.id }, 'settings', formattedForm);
  console.log('Result', result);
  if (result.id) {
    notify(['green', t('notify.saved')]);
    resetTreasuryAssets();
    await clearStampCache(props.space.id);
    reloadSpace(props.space.id);
  }
}

function handleReset() {
  if (props.sourceSpace) {
    form.value = clone(props.sourceSpace);
  } else {
    form.value = clone(currentSettings.value);
  }
}

onMounted(async () => {
  if (props.space) {
    const spaceClone = clone(props.space);
    if (spaceClone) {
      form.value = spaceClone;
      currentSettings.value = clone(spaceClone);
    }
  }
  if (props.sourceSpace) {
    const fromClone = clone(props.sourceSpace);
    if (fromClone) {
      form.value = fromClone;
    }
  }
  try {
    const uri = await getSpaceUri(
      props.space.id,
      import.meta.env.VITE_DEFAULT_NETWORK
    );
    console.log('URI', uri);
    currentTextRecord.value = uri;
  } catch (e) {
    console.log(e);
  }

  loaded.value = true;
});

onMounted(() => {
  setPageTitle('page.title.space.settings', { space: props.space.name });
});

const {
  settingENSRecord,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  spaceControllerInput,
  setRecord,
  confirmSetRecord
} = useSpaceController();

const modalControllerEditOpen = ref(false);

async function handleSetRecord() {
  const tx = await setRecord();
  const receipt = await tx.wait();
  if (receipt) {
    reloadSpace(props.space.id);
  }
}
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="mb-3 px-4 md:px-0">
        <router-link :to="{ name: 'spaceProposals' }">
          <ButtonBack />
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('settings.header')" />
      </div>
      <LoadingRow v-if="!loaded" block />
      <BaseMessageBlock v-else-if="!currentTextRecord" level="warning">
        {{
          $t('settings.noRecord', {
            id: space.id,
            network: networks[defaultNetwork].name
          })
        }}
        <BaseLink :link="`https://app.ens.domains/name/${space.id}`">
          {{ $t('setup.seeOnEns') }}
        </BaseLink>
      </BaseMessageBlock>
      <template v-else>
        <div class="space-y-3">
          <BaseMessageBlock
            v-if="
              !(isSpaceController || isSpaceAdmin || ensOwner) &&
              currentTextRecord
            "
            class="mx-4 mb-5 md:mx-0"
            level="info"
          >
            {{ $t('settings.connectWithSpaceOwner') }}
          </BaseMessageBlock>

          <SettingsProfileBlock context="settings" />

          <SettingsLinkBlock context="settings" />

          <SettingsStrategiesBlock context="settings" />

          <SettingsAdminsBlock
            context="settings"
            :is-space-controller="isSpaceController"
          />

          <SettingsAuthorsBlock context="settings" />

          <SettingsValidationBlock context="settings" />

          <SettingsVotingBlock context="settings" />

          <SettingsDomainBlock context="settings" />

          <SettingsTreasuriesBlock context="settings" />

          <SettingsPluginsBlock context="settings" />
        </div>
      </template>
    </template>

    <template #sidebar-right>
      <div class="mt-5 lg:mt-0" />
      <div
        v-if="
          !(isSpaceController || isSpaceAdmin || ensOwner) && currentTextRecord
        "
      />
      <div v-else-if="loaded" class="lg:fixed lg:w-[318px]">
        <BaseBlock v-if="ensOwner || isSpaceAdmin || isSpaceController">
          <div class="space-y-2">
            <BaseButton
              v-if="ensOwner"
              :loading="settingENSRecord"
              class="block w-full"
              @click="modalControllerEditOpen = true"
            >
              {{ $t('settings.editController') }}
            </BaseButton>
            <div v-if="isSpaceAdmin || isSpaceController">
              <BaseButton class="mb-2 block w-full" @click="handleReset">
                {{ $t('reset') }}
              </BaseButton>
              <BaseButton
                :disabled="!isReadyToSubmit"
                :loading="isSending"
                class="block w-full"
                primary
                @click="handleSubmit"
              >
                {{ $t('save') }}
              </BaseButton>
            </div>
          </div>
        </BaseBlock>

        <BaseBlock class="mt-3">
          <div>
            <div class="mb-2 text-skin-link">
              {{ $t('newsletter.title') }}
            </div>
            <InputNewsletter tag="6449077" />
          </div>
        </BaseBlock>
      </div>
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalControllerEdit
      :open="modalControllerEditOpen"
      :current-text-record="currentTextRecord"
      :ens-address="space.id"
      @close="modalControllerEditOpen = false"
      @set="confirmSetRecord()"
    />
    <ModalUnsupportedNetwork
      :open="modalUnsupportedNetworkOpen"
      @close="modalUnsupportedNetworkOpen = false"
      @networkChanged="modalConfirmSetTextRecordOpen = true"
    />
    <ModalConfirmAction
      :open="modalConfirmSetTextRecordOpen"
      @close="modalConfirmSetTextRecordOpen = false"
      @confirm="handleSetRecord"
    >
      <div class="m-4 space-y-4 text-skin-link">
        <p>
          {{
            $t('setup.confirmToSetAddress', {
              address: shorten(spaceControllerInput)
            })
          }}
          {{ $t('setup.controllerHasAuthority') + '.' }}
        </p>
      </div>
    </ModalConfirmAction>
  </teleport>
</template>
