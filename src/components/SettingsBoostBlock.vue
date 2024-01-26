<script setup lang="ts">
const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);

watch(
  () => form.value.boost.enabled,
  value => {
    if (value === false) {
      form.value.boost.restriction = '';
    }
  }
);
</script>

<template>
  <BaseBlock title="Boost">
    <div class="space-y-2">
      <TuneSwitch
        v-model="form.boost.enabled"
        label="Enable boost"
        :disabled="props.isViewOnly"
      />
      <TuneListbox
        v-model="form.boost.restriction"
        :disabled="form.boost.enabled === false || props.isViewOnly"
        label="Restrict usage"
        :items="[
          {
            value: 'no-bribe',
            name: 'Disable bribe'
          }
        ]"
        title="Boost"
      />
    </div>
  </BaseBlock>
</template>
