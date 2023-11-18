<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  context: 'setup' | 'settings';
  showErrors?: boolean;
  isViewOnly?: boolean;
}>();

const { form, validationErrors } = useFormSpaceSettings(props.context);

const modalValidationOpen = ref(false);

function handleSubmitAddValidation(input) {
  form.value.validation = clone(input);
}

function handleClickSelectValidation() {
  if (form.value.filters.onlyMembers) return;
  modalValidationOpen.value = true;
}
</script>

<template>
  <BaseBlock :title="$t('settings.proposalValidation')">
    <div class="space-y-2">
      <TuneButtonSelect
        class="w-full"
        :label="$t(`proposalValidation.label`)"
        :hint="$t(`proposalValidation.information`)"
        :model-value="$t(`proposalValidation.${form.validation.name}.label`)"
        :disabled="form.filters.onlyMembers || isViewOnly"
        @select="handleClickSelectValidation"
      />

      <TuneSwitch
        v-model="form.filters.onlyMembers"
        :disabled="isViewOnly"
        :label="$t('settings.allowOnlyAuthors')"
      />
    </div>
    <BaseMessageBlock
      v-if="validationErrors.validation && showErrors"
      level="warning-red"
      class="mt-4"
    >
      {{ $t('missingProposalValidationError') }}
    </BaseMessageBlock>
    <teleport to="#modal">
      <ModalValidation
        :open="modalValidationOpen"
        :validation="form.validation"
        :voting-strategies="form.strategies"
        :filter-min-score="form.filters.minScore"
        @close="modalValidationOpen = false"
        @add="handleSubmitAddValidation"
        @reset-min-score="form.filters.minScore = 0"
      />
    </teleport>
  </BaseBlock>
</template>
