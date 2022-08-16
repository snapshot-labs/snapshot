<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import Form from './components/Form.vue';

defineProps<{
  space: ExtendedSpace;
  proposal: any;
  modelValue: any;
}>();

const emit = defineEmits(['update']);
const update = form => {
  emit('update', { key: 'safeSnap', form });
};
</script>

<template>
  <Form
    v-if="space.plugins.safeSnap"
    :proposal="proposal"
    :config="space.plugins.safeSnap"
    :network="space.network"
    :model-value="modelValue?.safeSnap || {}"
    @update:modelValue="update"
  />
</template>
