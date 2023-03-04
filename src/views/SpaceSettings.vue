<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { shorten, clearStampCache } from '@/helpers/utils';
import { ExtendedSpace } from '@/helpers/interfaces';

import {
  useI18n,
  useWeb3,
  useClient,
  useSpaceController,
  useExtendedSpaces,
  useFormSpaceSettings,
  useTreasury,
  useFlashNotification,
  useGnosis,
  useMeta
} from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
}>();

useMeta({
  title: {
    key: 'metaInfo.space.settings.title',
    params: {
      space: props.space.name
    }
  },
  description: {
    key: 'metaInfo.space.settings.description'
  }
});

const { t } = useI18n();
const { web3Account } = useWeb3();
const { send, isSending } = useClient();
const { reloadSpace } = useExtendedSpaces();
const {
  form,
  validationResult,
  isValid,
  isReadyToSubmit,
  populateForm,
  resetForm
} = useFormSpaceSettings('settings');
const { resetTreasuryAssets } = useTreasury();
const { notify } = useFlashNotification();
const { isGnosisAndNotDefaultNetwork } = useGnosis();
const {
  settingENSRecord,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  spaceControllerInput,
  setRecord,
  loadEnsOwner,
  isEnsOwner,
  loadSpaceController,
  isSpaceController
} = useSpaceController();

const loaded = ref(false);
const modalControllerEditOpen = ref(false);

const isSpaceAdmin = computed(() => {
  if (!props.space) return false;
  const admins = (props.space?.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});

async function handleSubmit() {
  if (!isValid.value)
    return console.log('Invalid schema', validationResult.value);

  const result = await send({ id: props.space.id }, 'settings', form.value);
  console.log('Result', result);
  if (result.id) {
    notify(['green', t('notify.saved')]);
    resetTreasuryAssets();
    await clearStampCache(props.space.id);
    reloadSpace(props.space.id);
  }
}

async function handleSetRecord() {
  const tx = await setRecord();
  const receipt = await tx.wait();
  if (receipt) {
    reloadSpace(props.space.id);
  }
}

onMounted(async () => {
  populateForm(props.space);
  await loadEnsOwner();
  await loadSpaceController();
  loaded.value = true;
});
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

      <template v-else>
        <div class="space-y-3">
          <MessageWarningGnosisNetwork
            v-if="isGnosisAndNotDefaultNetwork"
            :space="space"
            action="settings"
            is-responsive
          />

          <BaseMessageBlock
            v-else-if="!(isSpaceController || isSpaceAdmin || isEnsOwner)"
            class="mx-4 mb-3 md:mx-0"
            level="info"
          >
            {{ $t('settings.connectWithSpaceOwner') }}
          </BaseMessageBlock>

          <SettingsProfileBlock context="settings" />

          <SettingsLinkBlock context="settings" />

          <SettingsSubSpacesBlock context="settings" />

          <SettingsStrategiesBlock context="settings" />

          <SettingsMembersBlock
            context="settings"
            :space="space"
            :is-space-controller="isSpaceController"
          />

          <SettingsProposalBlock context="settings" />

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
      <div v-if="!(isSpaceController || isSpaceAdmin || isEnsOwner)" />
      <div v-else-if="loaded" class="lg:fixed lg:w-[318px]">
        <BaseBlock v-if="isEnsOwner || isSpaceAdmin || isSpaceController">
          <div class="space-y-2">
            <BaseButton
              v-if="isEnsOwner"
              :loading="settingENSRecord"
              class="block w-full"
              @click="modalControllerEditOpen = true"
            >
              {{ $t('settings.editController') }}
            </BaseButton>
            <div v-if="isSpaceAdmin || isSpaceController">
              <BaseButton class="mb-2 block w-full" @click="resetForm">
                {{ $t('reset') }}
              </BaseButton>
              <BaseButton
                :disabled="!isReadyToSubmit || isGnosisAndNotDefaultNetwork"
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
      :ens-address="space.id"
      @close="modalControllerEditOpen = false"
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
