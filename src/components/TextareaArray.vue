<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Array
});

const emit = defineEmits(['update:modelValue']);

const input = computed({
  get: () => (props.modelValue ? props.modelValue.join('\n') : ''),
  set: newVal => {
    const inputString = newVal
      .replace(/\n/g, ' ')
      .replace(/,/g, ' ')
      .replace(/;/g, ' ')
      .split(' ')
      .map(item => item.trim())
      .filter(item => !!item);
    emit('update:modelValue', inputString);
  }
});
</script>

<template>
  <TextareaAutosize v-model="input" />
</template>
