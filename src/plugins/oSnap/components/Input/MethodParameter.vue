<script setup lang="ts">
import { ParamType } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import AddressInput from './Address.vue';

const props = defineProps<{
  parameter: ParamType;
  value: string;
}>();

const emit = defineEmits<{
  updateParameterValue: [value: string];
}>();

const isDirty = ref(false);
const isBooleanInput = computed(() => props.parameter.baseType === 'bool');
const isAddressInput = computed(() => props.parameter.baseType === 'address');
const isNumberInput = computed(() => props.parameter.baseType.includes('int'));
const isBytesInput = computed(() => props.parameter.baseType.includes('bytes'));
const isArrayInput = computed(
  () =>
    props.parameter.baseType === 'array' || props.parameter.baseType === 'tuple'
);

const inputType = computed(() => {
  if (isBooleanInput.value) return 'boolean';
  if (isAddressInput.value) return 'address';
  if (isNumberInput.value) return 'number';
  if (isBytesInput.value) return 'bytes';
  if (isArrayInput.value) return 'array';
  return 'text';
});

const label = `${props.parameter.name} (${props.parameter.type})`;
const arrayPlaceholder = `E.g. ["text", 123, 0x123]`;

const isInputValid = computed(() => {
  if (!isDirty.value) return true;
  if (isAddressInput.value) return isAddress(newValue.value);
  if (isArrayInput.value) return validateArrayInput(newValue.value);
  if (isNumberInput.value) return validateNumberInput(newValue.value);
  if (isBytesInput.value) return validateBytesInput(newValue.value);
  return true;
});

const newValue = ref(props.value);

watch(props.parameter, () => {
  newValue.value = '';
  isDirty.value = false;
});

watch(newValue, () => {
  if (isInputValid.value) {
    emit('updateParameterValue', newValue.value);
  }
});

function validateNumberInput(value: string) {
  return isBigNumberish(value);
}

function validateBytesInput(value: string) {
  return value.startsWith('0x');
}

function validateArrayInput(value: string) {
  try {
    const parsedValue = JSON.parse(value) as Array<string> | unknown;
    if (!Array.isArray(parsedValue)) return false;
    if (
      props.parameter.arrayLength !== -1 &&
      parsedValue.length !== props.parameter.arrayLength
    )
      return false;
    return true;
  } catch (e) {
    return false;
  }
}

function onChange(value: string) {
  newValue.value = value;
  isDirty.value = true;
}
</script>

<template>
  <UiSelect
    v-if="inputType === 'boolean'"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
    <option :value="true">true</option>
    <option :value="false">false</option>
  </UiSelect>

  <AddressInput
    v-if="inputType === 'address'"
    :label="label"
    :model-value="value"
    @update:model-value="onChange($event)"
  />
  <UiInput
    v-if="inputType === 'array'"
    :placeholder="arrayPlaceholder"
    :error="!isInputValid && `Invalid ${parameter.baseType}`"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="inputType === 'number'"
    placeholder="123456"
    :error="!isInputValid && `Invalid ${parameter.baseType}`"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="inputType === 'bytes'"
    placeholder="0x123abc"
    :error="!isInputValid && `Invalid ${parameter.baseType}`"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="inputType === 'text'"
    placeholder="a string of text"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
</template>
