<script setup lang="ts">
defineProps<{
  modelValue: string[];
  title?: string;
  placeholder?: string;
}>();

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
  <LabelInput>
    {{ title || '' }}
  </LabelInput>
  <TextareaAutosize
    v-bind="$attrs"
    :model-value="modelValue?.join('\n')"
    :placeholder="placeholder || ''"
    class="input w-full text-left"
    @update:modelValue="handleInput($event)"
  />
</template>
