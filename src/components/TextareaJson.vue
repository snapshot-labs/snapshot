<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object,
  isValid: Boolean
});

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const input = computed({
  get: () =>
    props.modelValue ? JSON.stringify(props.modelValue, null, 2) : '',
  set: newVal => {
    try {
      emit('update:modelValue', JSON.parse(newVal));
      emit('update:isValid', true);
    } catch (e) {
      emit('update:isValid', false);
    }
  }
});
</script>

<template>
  <TextareaAutosize v-model="input" />
</template>
