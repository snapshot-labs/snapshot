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

enum Page {
  GENERAL,
  STRATEGIES,
  PROPOSAL,
  VOTING,
  ADVANCED
}

const loaded = ref(false);
const modalControllerEditOpen = ref(false);
const currentPage = ref(Page.GENERAL);

const isSpaceAdmin = computed(() => {
  if (!props.space) return false;
  const admins = (props.space?.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});

const settingsPages = computed(() => [
  {
    id: Page.GENERAL,
    title: t('settings.navigation.general')
  },
  {
    id: Page.STRATEGIES,
    title: t('settings.navigation.strategies')
  },
  {
    id: Page.PROPOSAL,
    title: t('settings.navigation.proposal')
  },
  {
    id: Page.VOTING,
    title: t('settings.navigation.voting')
  },
  {
    id: Page.ADVANCED,
    title: t('settings.navigation.advanced')
  }
]);

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
    <div class="mb-3 px-4 md:px-0">
      <router-link :to="{ name: 'spaceProposals' }">
        <ButtonBack />
      </router-link>
    </div>
    <template #content-right>
      <LoadingRow v-if="!loaded" block />

      <template v-else>
        <div class="mt-3 space-y-3 sm:mt-0">
          <MessageWarningGnosisNetwork
            v-if="isGnosisAndNotDefaultNetwork"
            :space="space"
            action="settings"
            is-responsive
          />

          <BaseMessageBlock
            v-else-if="!(isSpaceController || isSpaceAdmin || isEnsOwner)"
            class="mt-3 md:mx-0"
            level="info"
            is-responsive
          >
            {{ $t('settings.connectWithSpaceOwner') }}
          </BaseMessageBlock>

          <template v-if="currentPage === Page.GENERAL">
            <SettingsProfileBlock context="settings" />
            <SettingsLinkBlock context="settings" />
            <SettingsMembersBlock
              context="settings"
              :space="space"
              :is-space-controller="isSpaceController"
            />
          </template>

          <template v-if="currentPage === Page.STRATEGIES">
            <SettingsStrategiesBlock context="settings" />
          </template>

          <template v-if="currentPage === Page.PROPOSAL">
            <SettingsProposalBlock context="settings" />

            <SettingsValidationBlock context="settings" />
          </template>

          <template v-if="currentPage === Page.VOTING">
            <SettingsVotingBlock context="settings" />
          </template>

          <template v-if="currentPage === Page.ADVANCED">
            <SettingsPluginsBlock context="settings" />
            <SettingsTreasuriesBlock context="settings" />
            <SettingsSubSpacesBlock context="settings" />
            <SettingsDomainBlock context="settings" />
            <SettingsDangerzoneBlock
              :is-controller="isSpaceController"
              :is-owner="isEnsOwner"
              :is-setting-ens-record="settingENSRecord"
              @change-controller="modalControllerEditOpen = true"
              @delete-space="null"
            />
          </template>
          <div v-if="isSpaceAdmin || isSpaceController" class="flex gap-5 pt-2">
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
      </template>
    </template>

    <template #sidebar-left>
      <BaseBlock slim class="overflow-hidden !border-t-0 md:!border-t">
        <div class="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
          <div
            class="no-scrollbar mt-0 flex overflow-y-auto md:mt-4 lg:my-3 lg:block"
          >
            <BaseSidebarNavigationItem
              v-for="page in settingsPages"
              :key="page.id"
              :is-active="currentPage === page.id"
              @click="currentPage = page.id"
            >
              {{ page.title }}
            </BaseSidebarNavigationItem>
          </div>
        </div>
      </BaseBlock>
      <BaseBlock class="my-3">
        <div class="mb-2 text-skin-link">
          {{ $t('newsletter.join') }}
        </div>
        <InputNewsletter tag="6449077" />
      </BaseBlock>
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
