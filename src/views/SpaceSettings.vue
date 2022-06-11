<script setup lang="ts">
import { computed, ref, inject, watch, onMounted } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { getAddress } from '@ethersproject/address';
import { useWeb3 } from '@/composables/useWeb3';
import { shorten, clearAvatarCache } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { useSpaceController } from '@/composables/useSpaceController';
import { useEns } from '@/composables/useEns';
import { getSpaceUri, clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const props = defineProps<{
  space: ExtendedSpace;
  sourceSpace: ExtendedSpace;
}>();

const { t, setPageTitle } = useI18n();
const { web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { reloadSpace } = useExtendedSpaces();
const { form, validate, formatSpace, getErrorMessage } = useSpaceSettingsForm();
const notify: any = inject('notify');

const currentSettings = ref({});
const currentTextRecord = ref('');
const loaded = ref(false);
const uploadLoading = ref(false);

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const isValid = computed(() => {
  return (
    !clientLoading.value && validate.value === true && !uploadLoading.value
  );
});

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
  if (isValid.value) {
    const formattedForm = formatSpace(form.value);
    const result = await send(
      { id: props.space.id },
      'settings',
      formattedForm
    );
    console.log('Result', result);
    if (result.id) {
      notify(['green', t('notify.saved')]);
      await clearAvatarCache(props.space.id);
      reloadSpace(props.space.id);
    }
  } else {
    console.log('Invalid schema', validate.value);
  }
}

function handleReset() {
  if (props.sourceSpace) return (form.value = clone(props.sourceSpace));
  if (currentSettings.value) return (form.value = clone(currentSettings.value));
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
        <router-link :to="{ name: 'spaceProposals' }" class="text-skin-text">
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('settings.header')" />
      </div>
      <LoadingRow v-if="!loaded" block />
      <template v-else-if="currentTextRecord">
        <div class="space-y-3">
          <BaseMessage
            v-if="
              !(isSpaceController || isSpaceAdmin || ensOwner) &&
              currentTextRecord
            "
            class="mx-4 mb-5 md:mx-0"
            level="info"
          >
            {{ $t('settings.connectWithSpaceOwner') }}
          </BaseMessage>

          <SettingsProfileBlock
            v-model:name="form.name"
            v-model:about="form.about"
            v-model:categories="form.categories"
            v-model:avatar="form.avatar"
            v-model:private="form.private"
            v-model:terms="form.terms"
            :get-error-message="getErrorMessage"
          />

          <SettingsLinkBlock
            v-model:twitter="form.twitter"
            v-model:github="form.github"
            v-model:website="form.website"
            :get-error-message="getErrorMessage"
          />

          <SettingsStrategiesBlock
            :form="form"
            :get-error-message="getErrorMessage"
            @update-strategies="val => (form.strategies = val)"
            @update-network="val => (form.network = val)"
            @update-symbol="val => (form.symbol = val)"
          />

          <SettingsAdminsBlock
            :admins="form.admins"
            :is-space-controller="isSpaceController"
            :get-error-message="getErrorMessage"
            @update:admins="val => (form.admins = val)"
          />

          <SettingsAuthorsBlock
            :members="form.members"
            :get-error-message="getErrorMessage"
            @update:members="val => (form.members = val)"
          />

          <SettingsValidationBlock
            v-model:validation="form.validation"
            :filters="form.filters"
            :get-error-message="getErrorMessage"
            @update:min-score="val => (form.filters.minScore = val)"
            @update:only-members="val => (form.filters.onlyMembers = val)"
          />

          <SettingsVotingBlock
            v-model:delay="form.voting.delay"
            v-model:period="form.voting.period"
            v-model:quorum="form.voting.quorum"
            v-model:type="form.voting.type"
            v-model:hideAbstain="form.voting.hideAbstain"
          />

          <SettingsDomainBlock
            v-model:domain="form.domain"
            v-model:skin="form.skin"
            :get-error-message="getErrorMessage"
          />

          <SettingsPluginsBlock
            :plugins="form.plugins"
            @update:plugins="val => (form.plugins = val)"
          />
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
        <BaseBlock>
          <BaseButton
            v-if="ensOwner"
            :loading="settingENSRecord"
            class="mb-2 block w-full"
            @click="modalControllerEditOpen = true"
          >
            {{ $t('settings.editController') }}
          </BaseButton>
          <div v-if="isSpaceAdmin || isSpaceController">
            <BaseButton class="mb-2 block w-full" @click="handleReset">
              {{ $t('reset') }}
            </BaseButton>
            <BaseButton
              :disabled="uploadLoading"
              :loading="clientLoading"
              class="block w-full"
              primary
              @click="handleSubmit"
            >
              {{ $t('save') }}
            </BaseButton>
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
