<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Array
});

const emit = defineEmits(['update:modelValue']);

const input = ref('');

function handleInput() {
  const inputString = input.value
    .replace(/\n/g, ' ')
    .replace(/,/g, ' ')
    .replace(/;/g, ' ')
    .split(' ')
    .map(item => item.trim())
    .filter(item => !!item);
  emit('update:modelValue', inputString);
}

watch(input, () => handleInput());

if (props.modelValue) input.value = props.modelValue.join('\n');
</script>

<template>
  <TextareaAutosize v-model="input" />
</template>
