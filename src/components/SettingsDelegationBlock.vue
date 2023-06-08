<script setup lang="ts">
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock title="Delegates portal">
    <BaseMessageBlock level="info" class="mb-3">
      Please ensure your token adheres to a compatible delegation standard to
      enable delegate discovery and activity within your Snapshot space.
    </BaseMessageBlock>
    <TuneForm
      v-model="form.delegation"
      :definition="schemas.space.properties.delegationPortal"
      :error="{}"
    />
  </BaseBlock>
</template>
