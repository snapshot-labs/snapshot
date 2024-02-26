<script setup lang="ts">
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
  <div class="m-4 flex flex-col gap-4">
    <p class="text-sm text-skin-text opacity-60">
      {{ t('emailManagement.subtitle') }}
    </p>

    <form class="flex flex-col space-y-4" @submit.prevent="submit">
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

      <TuneButton class="w-full" primary type="submit" :loading="loading">
        {{ t('emailManagement.updatePreferences') }}
      </TuneButton>
    </form>
  </div>
</template>
