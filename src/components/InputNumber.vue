<script setup lang="ts">
const props = defineProps<{
  modelValue?: number | string;
  definition?: any;
  error?: { message: string; push?: boolean };
  placeholder?: string;
  information?: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    :model-value="props.modelValue || props.definition?.default"
    :definition="definition"
    :error="error"
    :placeholder="placeholder"
    :information="information"
    type="number"
    @update:model-value="emit('update:modelValue', Number($event))"
  />
</template>
