<script setup>
import Config from './components/Config.vue';

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
  <Config
    v-if="space.plugins.safeSnap"
    :proposal="proposal"
    :config="space.plugins.safeSnap"
    :network="space.network"
    :preview="preview"
    @update:modelValue="update"
    :modelValue="modelValue?.safeSnap || {}"
    :spaceId="space.id"
  />
</template>
