<script setup lang="ts">
import { ref } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getValidation } = useSpaceForm(props.context);

const modalValidationOpen = ref(false);

function handleSubmitAddValidation(input) {
  form.value.validation = clone(input);
}
</script>

<template>
  <BaseBlock :title="$t('settings.proposalValidation')">
    <div class="space-y-2">
      <ContainerParallelInput>
        <InputSelect
          class="w-full"
          :title="$t(`settings.validation`)"
          :error="getValidation('validation')"
          :model-value="form.validation.name"
          @click="modalValidationOpen = true"
        />

        <InputNumber
          v-if="form.validation.name === 'basic'"
          v-model="form.filters.minScore"
          :title="$t('settings.proposalThreshold.label')"
          :information="$t('settings.proposalThreshold.information')"
          :error="getValidation('minScore')"
          placeholder="1000"
        />
      </ContainerParallelInput>

      <InputSwitch
        v-if="form.validation.name === 'basic'"
        v-model="form.filters.onlyMembers"
        :text-right="$t('settings.allowOnlyAuthors')"
      />
    </div>
    <teleport to="#modal">
      <ModalValidation
        :open="modalValidationOpen"
        :validation="form.validation"
        @close="modalValidationOpen = false"
        @add="handleSubmitAddValidation"
      />
    </teleport>
  </BaseBlock>
</template>
