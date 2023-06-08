<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock :title="$t('settings.delegationPortal.title')">
    <BaseMessageBlock level="info" class="mb-3">
      {{ $t('settings.delegationPortal.information') }}
    </BaseMessageBlock>
    <TuneForm
      v-model="form.delegation"
      :definition="schemas.space.properties.delegationPortal"
      :error="{}"
    />
  </BaseBlock>
</template>
