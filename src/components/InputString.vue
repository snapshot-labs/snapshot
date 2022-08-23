<script setup lang="ts">
defineProps<{
  modelValue?: string;
  definition?: any;
  error?: { message: string; push?: boolean };
  placeholder?: string;
  information?: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    :model-value="modelValue || definition?.default"
    :definition="definition"
    :error="error"
    :placeholder="placeholder"
    :information="information"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
