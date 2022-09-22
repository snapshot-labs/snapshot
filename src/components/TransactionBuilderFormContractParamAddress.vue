<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
  }>(),
  {
    modelValue: '0x'
  }
);

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const input = ref<string>(props.modelValue);

const addressError = computed<{ message: string } | undefined>(() => {
  if (!isAddress(input.value)) return { message: 'Address is not valid' };

  return undefined;
});
</script>

<template>
  <LabelInput>{{ label }}</LabelInput>
  <InputString
    v-model="input"
    placeholder="0x..."
    :error="addressError"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
