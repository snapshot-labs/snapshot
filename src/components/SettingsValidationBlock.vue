<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
  space?: ExtendedSpace;
}>();

const { form } = useFormSpaceSettings(props.context);

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
      <ContainerParallelInput>
        <InputSelect
          class="w-full"
          :title="$t(`proposalValidation.label`)"
          :information="$t(`proposalValidation.information`)"
          :model-value="$t(`proposalValidation.${form.validation.name}.label`)"
          :is-disabled="form.filters.onlyMembers || isViewOnly"
          @select="handleClickSelectValidation"
        />
      </ContainerParallelInput>

      <InputSwitch
        v-model="form.filters.onlyMembers"
        :is-disabled="isViewOnly"
        :text-right="$t('settings.allowOnlyAuthors')"
      />
    </div>
    <teleport to="#modal">
      <ModalValidation
        :open="modalValidationOpen"
        :validation="form.validation"
        :filter-min-score="form.filters.minScore"
        :space="space"
        @close="modalValidationOpen = false"
        @add="handleSubmitAddValidation"
      />
    </teleport>
  </BaseBlock>
</template>
