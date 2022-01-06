<script setup>
defineProps({
  space: Object,
  preview: Boolean,
  modelValue: Object
});

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'safeSnap', form });
};
</script>

<template>
  <PluginSafeSnapConfig
    v-if="space.plugins.safeSnap"
    :proposal="proposal"
    :config="space.plugins.safeSnap"
    :network="space.network"
    :preview="preview"
    @update:modelValue="update"
    :modelValue="modelValue"
  />
</template>
