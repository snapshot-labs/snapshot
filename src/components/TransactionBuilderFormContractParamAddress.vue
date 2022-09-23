<script setup lang="ts">
import { FormError } from '@/helpers/transactionBuilder';
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    error: FormError;
  }>(),
  {
    modelValue: '0x'
  }
);

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const input = ref<string>(props.modelValue);
</script>

<template>
  <LabelInput>{{ label }}</LabelInput>
  <InputString
    v-model="input"
    placeholder="0x..."
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
