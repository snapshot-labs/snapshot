<script setup>
defineProps({
  space: Object,
  proposal: Object,
  preview: Boolean,
  modelValue: Object
});

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'aragon', form });
};
</script>

<template>
  <Block title="Aragon">
    <PluginAragonConfig
      v-if="space.plugins.aragon"
      :proposal="proposal"
      :modelValue="modelValue"
      @update:modelValue="update"
    />
  </Block>
</template>
