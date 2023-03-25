<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: Record<string, unknown>;
  isValid: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const input = computed({
  get: () =>
    props.modelValue ? JSON.stringify(props.modelValue, null, 2) : '',
  set: value => {
    try {
      emit('update:modelValue', JSON.parse(value));
      emit('update:isValid', true);
    } catch (e) {
      emit('update:isValid', false);
    }
  }
});
</script>

<template>
  <TextareaAutosize
    v-model="input"
    class="no-scrollbar w-full !overflow-x-scroll whitespace-pre font-mono text-sm"
  />
</template>
