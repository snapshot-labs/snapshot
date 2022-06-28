<script setup>
import GnosisConfig from './components/Config.vue';
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({
  space: Object,
  proposal: Object,
  modelValue: Object
});

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'gnosis', form });
};
</script>

<template>
  <BaseBlock :title="pluginIndex.gnosis.name">
    <GnosisConfig
      v-if="space.plugins.gnosis"
      :proposal="proposal"
      :network="space.network"
      :model-value="
        modelValue?.gnosis || {
          network: '1',
          conditionId: '',
          baseTokenAddress: '',
          quoteCurrencyAddress: ''
        }
      "
      @update:modelValue="update"
    />
  </BaseBlock>
</template>
