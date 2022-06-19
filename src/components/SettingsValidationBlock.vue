<script setup lang="ts">
import { ref } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

defineProps<{
  validation: { name: string };
  filters: { minScore: number; onlyMembers: boolean };
  getErrorMessage: (field: string) => { message: string; push: boolean };
}>();

const emit = defineEmits([
  'update:validation',
  'update:onlyMembers',
  'update:minScore'
]);

const modalValidationOpen = ref(false);

function handleSubmitAddValidation(validation) {
  emit('update:validation', clone(validation));
}
</script>

<template>
  <BaseBlock :title="$t('settings.proposalValidation')">
    <div class="space-y-2">
      <ContainerParallelInput>
        <InputSelect
          class="w-full"
          :title="$t(`settings.validation`)"
          :error="getErrorMessage('settings.validation')"
          :model-value="validation.name"
          @click="modalValidationOpen = true"
        />

        <InputNumber
          v-if="validation.name === 'basic'"
          :title="$t('settings.proposalThreshold.label')"
          :information="$t('settings.proposalThreshold.information')"
          :model-value="filters.minScore"
          :error="getErrorMessage('minScore')"
          placeholder="1000"
          @update:model-value="emit('update:minScore', $event)"
        />
      </ContainerParallelInput>

      <BaseSwitch
        v-if="validation.name === 'basic'"
        :model-value="filters.onlyMembers"
        :text-right="$t('settings.allowOnlyAuthors')"
        @update:model-value="emit('update:onlyMembers', $event)"
      />
    </div>
    <teleport to="#modal">
      <ModalValidation
        :open="modalValidationOpen"
        :validation="validation"
        @close="modalValidationOpen = false"
        @add="handleSubmitAddValidation"
      />
    </teleport>
  </BaseBlock>
</template>
