<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import Config from './components/Config.vue';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  modelValue: { oSnap: any } | undefined;
}>();

console.log(props);


const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'oSnap', form });
};
</script>

<template>
  <Config
    v-if="space.plugins.oSnap"
    :proposal="proposal"
    :preview="false"
    :model-value="modelValue?.oSnap || {}"
    @update:modelValue="update"
  />
</template>
