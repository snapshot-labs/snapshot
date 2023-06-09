<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form, validationErrors, addRef } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock :title="$t('settings.delegationPortal.title')">
    <BaseMessageBlock level="info" class="mb-3">
      {{ $t('settings.delegationPortal.information') }}
    </BaseMessageBlock>
    <TuneForm
      :ref="addRef"
      v-model="form.delegationPortal"
      :definition="schemas.space.properties.delegationPortal"
      :error="validationErrors?.delegationPortal || {}"
    />
  </BaseBlock>
</template>
