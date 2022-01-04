<script setup>
defineProps({
  space: Object,
  preview: Boolean,
  modelValue: Object
});

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'safeSnap', form })
}
</script>

<template>
  <Block v-if="space.plugins.safeSnap">
    <PluginSafeSnapConfig
      :proposal="proposal"
      :config="space.plugins.safeSnap"
      :network="space.network"
      :preview="preview"
      @update:modelValue="update"
      :modelValue="modelValue"
    />
  </Block>
</template>