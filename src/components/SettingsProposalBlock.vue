<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getValidation } = useSpaceForm(props.context);
</script>

<template>
  <BaseBlock :title="$t('settings.proposal.title')">
    <div class="space-y-2">
      <InputUrl
        v-model="form.guidelines"
        :title="$t('settings.proposal.guidelines.title')"
        :information="$t('settings.proposal.guidelines.information')"
        placeholder="e.g. https://example.com/guidelines"
        :error="getValidation('guidelines')"
        :max-length="schemas.space.properties.guidelines.maxLength"
      />

      <TextareaAutosize
        v-model="form.template"
        class="input"
        :title="$t('settings.proposal.template.title')"
        :information="$t('settings.proposal.template.information')"
        :placeholder="`## Intro\n## Body\n## Conclusion`"
        :max-length="schemas.space.properties.template.maxLength"
      />
    </div>
  </BaseBlock>
</template>
