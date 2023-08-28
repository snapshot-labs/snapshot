<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import Config from './components/Config.vue';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  modelValue: any;
}>();

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'oSnap', form });
};
</script>

<template>
  <Config
    v-if="space.plugins.oSnap"
    :proposal="proposal"
    :config="space.plugins.oSnap"
    :network="space.network"
    :preview="false"
    :model-value="modelValue?.oSnap || {}"
    @update:modelValue="update"
  />
</template>
