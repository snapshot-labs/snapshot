<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents } = usePlugins('Create');

addComponents(['safeSnap', 'chainlink']);

const props = defineProps({
  proposal: Object,
  space: Object,
  preview: Boolean,
  modelValue: Object
});
const emit = defineEmits(['update:modelValue']);
const update = data => {
  const allConfig = props.modelValue;
  allConfig[data.key] = data.form;
  emit('update:modelValue', allConfig);
};
</script>

<template>
  <component
    v-for="(plugin, key) in space.plugins"
    :key="key"
    :is="components[key]"
    v-bind="props"
    @update="update"
  />
</template>
