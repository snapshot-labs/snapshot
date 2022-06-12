<script setup lang="ts">
const props = defineProps<{
  modelValue?: number;
  definition?: any;
  error?: string;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    :model-value="props.modelValue || props.definition?.default"
    :definition="definition"
    :error="error"
    :placeholder="placeholder"
    type="number"
    @update:model-value="emit('update:modelValue', Number($event))"
  />
</template>
