<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

// Computed properties
const iconClass = computed(() => ({
  'text-red': props.type === 'error',
  'text-green': props.type === 'success'
}));

const textClass = computed(() => ({
  'text-s text-red': props.type === 'error',
  'text-s text-green': props.type === 'success'
}));

const emit = defineEmits(['close']);
</script>

<template>
  <div class="mb-3 flex justify-between">
    <div class="flex space-x-1">
      <i-ho :class="iconClass" class="text-md" />
      <p :class="textClass">{{ message }}</p>
    </div>
    <div class="cursor-pointer text-white" @click="emit('close')">
      <i-ho-x />
    </div>
  </div>
</template>
