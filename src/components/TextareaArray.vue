<script setup>
defineProps({
  modelValue: Array
});

const emit = defineEmits(['update:modelValue']);

function handleInput(input) {
  const inputString = input
    .replace(/\n/g, ' ')
    .replace(/,/g, ' ')
    .replace(/;/g, ' ')
    .split(' ')
    .map(item => item.trim())
    .filter(item => !!item)
    .filter((item, index, array) => array.indexOf(item) === index);
  emit('update:modelValue', inputString);
}
</script>

<template>
  <TextareaAutosize
    :model-value="modelValue?.join('\n')"
    @update:modelValue="handleInput($event)"
  />
</template>
