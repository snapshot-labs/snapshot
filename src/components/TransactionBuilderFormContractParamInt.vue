<script setup lang="ts">
import { ref } from 'vue';
import { BigNumber } from '@ethersproject/bignumber';
import { FormError } from '@/helpers/transactionBuilder';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    error: FormError;
  }>(),
  {
    modelValue: '0'
  }
);

defineEmits<{
  (e: 'update:modelValue', value: BigNumber): void;
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
