<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Number
});

const emit = defineEmits(['update:modelValue']);

const input = ref('');

function handleInput() {
  if (!input.value) return emit('update:modelValue', undefined);
  emit('update:modelValue', parseFloat(input.value));
}

if (props.modelValue) input.value = props.modelValue.toString();
</script>

<template>
  <input
    v-model="input"
    @input="handleInput"
    type="number"
    class="input width-full"
  />
</template>
