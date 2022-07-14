<script setup lang="ts">
defineProps<{
  modelValue?: string;
  focusOnMount?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    v-bind="$attrs"
    :model-value="modelValue"
    :focus-on-mount="focusOnMount"
    type="email"
    placeholder="Your email"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
