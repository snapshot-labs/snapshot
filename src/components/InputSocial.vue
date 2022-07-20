<script setup lang="ts">
defineProps<{
  modelValue?: string;
  error?: { message: string; push: boolean };
  placeholder?: string;
  maxLength?: number;
  title?: string;
  icon?: 'twitter' | 'github' | 'earth';
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    :title="title"
    :model-value="modelValue"
    :error="error"
    :placeholder="placeholder"
    :max-length="maxLength"
    class="!pl-[40px]"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <template #before>
      <BaseIcon :name="icon" />
    </template>
  </BaseInput>
</template>
