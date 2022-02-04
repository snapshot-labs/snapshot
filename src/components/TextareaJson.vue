<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Object,
  isValid: Boolean
});

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const input = ref('');

function handleInput() {
  try {
    emit('update:modelValue', JSON.parse(input.value));
    emit('update:isValid', true);
  } catch (e) {
    emit('update:isValid', false);
  }
}

watch(input, () => handleInput());

if (props.modelValue) input.value = JSON.stringify(props.modelValue, null, 2);
</script>

<template>
  <TextareaAutosize
    v-model="input"
    class="font-mono text-sm whitespace-pre w-full !overflow-x-scroll no-scrollbar"
  />
</template>
