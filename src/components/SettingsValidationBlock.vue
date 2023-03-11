<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useFormSpaceSettings } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
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

onMounted(() => {
  // This is a fix for older settings where the validation is set to basic but the minScore is not set
  // Which is equal to any
  if (form.value.validation.name === 'basic' && !form.value.filters.minScore) {
    form.value.validation.name = 'any';
  }
  // This is a fix for the depricated validation types nouns and aave
  if (
    form.value.validation.name === 'nouns' ||
    form.value.validation.name === 'aave'
  ) {
    form.value.validation.name = 'basic';
  }
});
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
          :disabled="form.filters.onlyMembers"
          @click="handleClickSelectValidation"
        />
      </ContainerParallelInput>

      <InputSwitch
        v-model="form.filters.onlyMembers"
        :text-right="$t('settings.allowOnlyAuthors')"
      />
    </div>
    <teleport to="#modal">
      <ModalValidation
        :open="modalValidationOpen"
        :validation="form.validation"
        :filter-min-score="form.filters.minScore"
        @close="modalValidationOpen = false"
        @add="handleSubmitAddValidation"
      />
    </teleport>
  </BaseBlock>
</template>
