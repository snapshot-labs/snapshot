<script setup lang="ts">
// Is this component even still needed? It's pure pass-through.
import { ref } from 'vue';
import { FormError } from '@/helpers/transactionBuilder';

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
