<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({
  space: Object,
  proposal: Object,
  preview: Boolean,
  modelValue: Object
});

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'gnosis', form });
};
</script>

<template>
  <Block :title="pluginIndex.gnosis.name">
    <PluginGnosisConfig
      v-if="space.plugins.gnosis"
      :proposal="proposal"
      :network="space.network"
      :modelValue="modelValue"
      @update:modelValue="update"
    />
  </Block>
</template>
