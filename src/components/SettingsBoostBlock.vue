<script setup lang="ts">
const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);
</script>

<template>
  <BaseBlock title="Boost">
    <div class="space-y-2">
      <TuneSwitch
        v-model="form.boost.enabled"
        label="Enable Boost"
        sublabel="Allow users to set up rewards for voters."
        :disabled="props.isViewOnly"
      />
      <TuneSwitch
        v-model="form.boost.bribeEnabled"
        label="Enable strategic incentivization"
        sublabel="Allow users to set up rewards for voting on a specific choice."
        :disabled="props.isViewOnly"
      />
    </div>
  </BaseBlock>
</template>
