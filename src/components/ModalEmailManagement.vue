<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close']);

const {
  loading,
  clientSubscriptions,
  shouldRemoveEmail,
  updateSubscriptions: update,
  isSubscribed
} = useEmailSubscription();
const { t } = useI18n();

const canRemoveEmail = computed(() => {
  const { newProposal, closedProposal, summary } = clientSubscriptions.value;
  return !newProposal && !closedProposal && !summary;
});

const updateSubscriptions = (key, value) => {
  clientSubscriptions.value = { ...clientSubscriptions.value, [key]: value };
};

const submit = async () => {
  await update();
  // TODO: canRemoveEmail check should be removed when `shouldRemoveEmail` will be implemented
  if (shouldRemoveEmail.value && canRemoveEmail.value) {
    isSubscribed.value = false;
    emit('close');
  }
};
</script>

<template>
  <BaseModal :open="open" max-height="510px" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('emailManagement.title') }}</h3>
      </div>
    </template>

    <div class="m-4 text-center">
      <p class="text-sm text-skin-text opacity-60">
        {{ t('emailManagement.subtitle') }}
      </p>
    </div>

    <form class="m-4 flex flex-col space-y-4" @submit.prevent="submit">
      <div class="ml-4 mt-auto flex items-start space-x-2">
        <InputSwitch
          :model-value="clientSubscriptions.newProposal"
          @update:model-value="updateSubscriptions('newProposal', $event)"
        />
        <div class="flex flex-col">
          <span>{{ t('emailManagement.optionNewProposal') }}</span>
          <span class="text-sm text-skin-text opacity-60">
            {{ t('emailManagement.optionNewProposalDescription') }}
          </span>
        </div>
      </div>

      <div class="ml-4 mt-auto flex items-start space-x-2">
        <InputSwitch
          :model-value="clientSubscriptions.closedProposal"
          @update:model-value="updateSubscriptions('closedProposal', $event)"
        />
        <div class="flex flex-col">
          <span>{{ t('emailManagement.optionClosedProposal') }}</span>
          <span class="text-sm text-skin-text opacity-60">
            {{ t('emailManagement.optionClosedProposalDescription') }}
          </span>
        </div>
      </div>

      <div class="ml-4 mt-auto flex items-start space-x-2">
        <InputSwitch
          :model-value="clientSubscriptions.summary"
          @update:model-value="updateSubscriptions('summary', $event)"
        />
        <div class="flex flex-col">
          <span>{{ t('emailManagement.optionSummary') }}</span>
          <span class="text-sm text-skin-text opacity-60">
            {{ t('emailManagement.optionSummaryDescription') }}
          </span>
        </div>
      </div>

      <InputCheckbox
        v-if="canRemoveEmail"
        v-model="shouldRemoveEmail"
        name="settings-saved-input-checkbox"
        :label="t('emailManagement.removeEmail')"
        class="pointer-events-none ml-4 mt-auto cursor-pointer self-start text-sm text-skin-text opacity-60"
      />

      <BaseButton class="mt-6 w-full" primary type="submit" :loading="loading">
        {{ t('emailManagement.updatePreferences') }}
      </BaseButton>
    </form>
  </BaseModal>
</template>
