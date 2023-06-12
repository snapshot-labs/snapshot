<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close']);

const { loading, error, clientSubscriptions, updateSubscriptions } =
  useEmailSubscription();
const { t } = useI18n();
const { notify } = useFlashNotification();

const updateSubscriptionKeys = (key, value) => {
  clientSubscriptions.value = { ...clientSubscriptions.value, [key]: value };
};

watchEffect(() => {
  if (error.value) {
    notify(['red', t('notify.somethingWentWrong')]);
  }
});

const submit = async () => {
  await updateSubscriptions();
  if (error.value) {
    error.value = null;
  } else {
    notify(['green', t('notify.emailPreferencesUpdated')]);
    emit('close');
  }
};
</script>

<template>
  <BaseModal :open="open" max-height="510px" @close="emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('emailManagement.title') }}</h3>
      </div>
    </template>

    <div class="mx-4 mb-4 mt-2 text-center">
      <p class="text-sm text-skin-text opacity-60">
        {{ t('emailManagement.subtitle') }}
      </p>
    </div>

    <form class="mx-6 my-4 flex flex-col space-y-4" @submit.prevent="submit">
      <TuneSwitch
        :model-value="clientSubscriptions.summary"
        :label="t('emailManagement.optionSummary')"
        :sublabel="t('emailManagement.optionSummaryDescription')"
        @update:model-value="updateSubscriptionKeys('summary', $event)"
      />

      <TuneSwitch
        :model-value="clientSubscriptions.newProposal"
        :label="t('emailManagement.optionNewProposal')"
        :sublabel="t('emailManagement.optionNewProposalDescription')"
        @update:model-value="updateSubscriptionKeys('newProposal', $event)"
      />

      <TuneSwitch
        :model-value="clientSubscriptions.closedProposal"
        :label="t('emailManagement.optionClosedProposal')"
        :sublabel="t('emailManagement.optionClosedProposalDescription')"
        @update:model-value="updateSubscriptionKeys('closedProposal', $event)"
      />

      <BaseButton class="mt-6 w-full" primary type="submit" :loading="loading">
        {{ t('emailManagement.updatePreferences') }}
      </BaseButton>
    </form>
  </BaseModal>
</template>
