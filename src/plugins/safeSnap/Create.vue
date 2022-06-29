<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import Config from './components/Config.vue';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  preview: boolean;
  modelValue: Record<string, any>;
}>();

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
    :preview="false"
    :model-value="modelValue?.safeSnap || {}"
    :space-id="space.id"
    @update:modelValue="update"
  />
</template>
