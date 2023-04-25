<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form, validationErrors, addRef } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock :title="$t('settings.proposal.title')">
    <div class="space-y-2">
      <TuneInputUrl
        :ref="addRef"
        v-model="form.guidelines"
        :label="$t('settings.proposal.guidelines.title')"
        :hint="$t('settings.proposal.guidelines.information')"
        placeholder="e.g. https://example.com/guidelines"
        :error="validationErrors?.guidelines"
        :max-length="schemas.space.properties.guidelines.maxLength"
        :disabled="isViewOnly"
      />

      <TuneTextarea
        v-model="form.template"
        class="input"
        :label="$t('settings.proposal.template.title')"
        :hint="$t('settings.proposal.template.information')"
        :placeholder="`## Intro\n## Body\n## Conclusion`"
        :max-length="schemas.space.properties.template.maxLength"
        :disabled="isViewOnly"
      />
    </div>
  </BaseBlock>
</template>
