<script setup lang="ts">
import { shorten, clearStampCache } from '@/helpers/utils';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useConfirmDialog, useStorage } from '@vueuse/core';

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
const { domain } = useApp();
const router = useRouter();
const { web3Account } = useWeb3();
const { send, isSending } = useClient();
const { reloadSpace, deleteSpace } = useExtendedSpaces();
const { loadFollows } = useFollowSpace();
const {
  validationErrors,
  isValid,
  isReadyToSubmit,
  hasFormChanged,
  prunedForm,
  populateForm,
  resetForm,
  forceShowError
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
  isSpaceController,
  ensOwner
} = useSpaceController();

enum Page {
  GENERAL,
  STRATEGIES,
  PROPOSAL,
  VOTING,
  DELEGATION,
  MEMBERS,
  ADVANCED
}

const loaded = ref(false);
const modalControllerEditOpen = ref(false);
const currentPage = ref(Page.GENERAL);
const modalDeleteSpaceConfirmation = ref('');
const modalSettingsSavedOpen = ref(false);
const modalSettingsSavedIgnore = useStorage(
  'snapshot.settings.saved.ignore',
  false
);
const showFormErrors = ref(false);

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
    id: Page.DELEGATION,
    title: t('settings.navigation.delegation')
  },
  {
    id: Page.MEMBERS,
    title: t('settings.navigation.members')
  },
  {
    id: Page.ADVANCED,
    title: t('settings.navigation.advanced')
  }
]);

async function handleDelete() {
  modalDeleteSpaceConfirmation.value = '';

  const result = await send(props.space, 'delete-space', null);
  console.log(':handleDelete result', result);

  if (result && result.id) {
    if (domain) {
      return window.open(`https://snapshot.org/#/`, '_self');
    } else {
      deleteSpace(props.space.id);
      loadFollows();
      return router.push({ name: 'home' });
    }
  }
}

async function handleSubmit() {
  if (!isValid.value) {
    showFormErrors.value = true;
    forceShowError();
    window.scrollTo(0, 0);
    return console.log('Invalid form', validationErrors.value);
  }

  const result = await send(props.space, 'settings', prunedForm.value);
  console.log('Result', result);
  if (result.id) {
    notify(['green', t('notify.saved')]);
    if (!modalSettingsSavedIgnore.value) modalSettingsSavedOpen.value = true;
    resetTreasuryAssets();
    await clearStampCache(props.space.id);
    await reloadSpace(props.space.id);
    populateForm(props.space);
  }
}

onMounted(async () => {
  populateForm(props.space);
  await loadEnsOwner();
  await loadSpaceController();
  loaded.value = true;
});

const {
  isRevealed: isConfirmLeaveOpen,
  reveal: openConfirmLeave,
  confirm: confirmLeave,
  cancel: cancelLeave
} = useConfirmDialog();

const {
  isRevealed: isConfirmDeleteOpen,
  reveal: openConfirmDelete,
  cancel: cancelDelete
} = useConfirmDialog();

onBeforeRouteLeave(async () => {
  if (hasFormChanged.value) {
    const { data } = await openConfirmLeave();
    if (!data) return false;
  }
});

const isViewOnly = computed(() => {
  return !(isSpaceController.value || isSpaceAdmin.value);
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <div class="mb-3 px-4 md:px-0">
      <ButtonBack @click="router.push({ name: 'spaceProposals' })" />
    </div>
    <template #content-right>
      <LoadingRow v-if="!loaded" block />

      <template v-else>
        <div class="mt-3 space-y-3 sm:mt-0">
          <BaseMessageBlock
            v-if="showFormErrors && Object.keys(validationErrors).length"
            level="warning-red"
          >
            {{ $t('settings.validationErrorsMessage') }}
            <span class="font-bold">
              {{
                Object.keys(validationErrors)
                  .map(key => key)
                  .join(', ')
              }}
            </span>
          </BaseMessageBlock>

          <MessageWarningGnosisNetwork
            v-else-if="isGnosisAndNotDefaultNetwork"
            :space="space"
            action="settings"
            is-responsive
          />

          <BaseMessageBlock
            v-else-if="isViewOnly"
            class="md:mx-0"
            level="info"
            is-responsive
          >
            {{ $t('settings.connectWithSpaceOwner') }}
          </BaseMessageBlock>

          <template v-if="currentPage === Page.GENERAL">
            <SettingsProfileBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
            <SettingsLinkBlock context="settings" :is-view-only="isViewOnly" />
          </template>

          <template v-if="currentPage === Page.STRATEGIES">
            <SettingsStrategiesBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
          </template>

          <template v-if="currentPage === Page.PROPOSAL">
            <SettingsValidationBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
            <SettingsProposalBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
          </template>

          <template v-if="currentPage === Page.VOTING">
            <SettingsVotingBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
          </template>

          <template v-if="currentPage === Page.DELEGATION">
            <SettingsDelegationBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
          </template>

          <template v-if="currentPage === Page.MEMBERS">
            <SettingsMembersBlock
              context="settings"
              :space="space"
              :is-space-controller="isSpaceController"
            />
          </template>

          <template v-if="currentPage === Page.ADVANCED">
            <SettingsPluginsBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
            <SettingsTreasuriesBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
            <SettingsSubSpacesBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
            <SettingsDomainBlock
              context="settings"
              :is-view-only="isViewOnly"
            />
            <SettingsDangerzoneBlock
              :is-controller="isSpaceController"
              :ens-owner="ensOwner"
              :is-owner="isEnsOwner"
              :is-setting-ens-record="settingENSRecord"
              :is-deleting="isConfirmDeleteOpen"
              @change-controller="modalControllerEditOpen = true"
              @delete-space="openConfirmDelete"
            />
          </template>
          <div
            v-if="isSpaceAdmin || isSpaceController"
            class="flex gap-5 px-4 pt-2 md:px-0"
          >
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
            <a
              v-for="page in settingsPages"
              :key="page.id"
              tabindex="0"
              @click="currentPage = page.id"
              @keypress="currentPage = page.id"
            >
              <BaseSidebarNavigationItem :is-active="currentPage === page.id">
                {{ page.title }}
              </BaseSidebarNavigationItem>
            </a>
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
      @confirm="setRecord"
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
    <ModalConfirmAction
      :open="isConfirmLeaveOpen"
      show-cancel
      @close="cancelLeave"
      @confirm="confirmLeave(true)"
    >
      <BaseMessageBlock level="warning" class="m-4">
        {{ $t('settings.confirmLeaveMessage') }}
      </BaseMessageBlock>
    </ModalConfirmAction>
    <ModalConfirmAction
      :open="isConfirmDeleteOpen"
      :disabled="modalDeleteSpaceConfirmation !== space.id"
      show-cancel
      @close="cancelDelete"
      @confirm="handleDelete"
    >
      <BaseMessageBlock level="warning" class="m-4">
        {{ $t('settings.confirmDeleteSpace') }}
      </BaseMessageBlock>
      <div class="px-4 pb-4">
        <BaseInput
          v-model.trim="modalDeleteSpaceConfirmation"
          :title="$t('settings.confirmInputDeleteSpace', { space: space.id })"
          focus-on-mount
        >
        </BaseInput>
      </div>
    </ModalConfirmAction>
    <ModalNotice
      :open="modalSettingsSavedOpen"
      :title="$t('settings.noticeSavedTitle')"
      @close="modalSettingsSavedOpen = false"
    >
      <BaseMessageBlock level="info" class="mb-5">
        <p class="text-left">{{ $t('settings.noticeSavedText') }}</p>
      </BaseMessageBlock>
      <InputCheckbox
        v-model="modalSettingsSavedIgnore"
        name="settings-saved-input-checkbox"
        :label="$t('settings.noticeSavedInputCheckboxLabel')"
        class="ml-4 mt-auto max-w-min cursor-pointer self-start whitespace-nowrap"
        @click="modalSettingsSavedIgnore = !modalSettingsSavedIgnore"
      />
    </ModalNotice>
  </teleport>
</template>
