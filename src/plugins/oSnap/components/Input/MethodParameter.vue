<script setup lang="ts">
import { ParamType } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import AddressInput from './Address.vue';
import { hexZeroPad, isBytesLike } from '@ethersproject/bytes';
import { isBytesLikeSafe } from '../../utils';

const props = defineProps<{
  parameter: ParamType;
  value: string;
  validateOnMount?: boolean;
}>();

const emit = defineEmits<{
  updateParameterValue: [value: string];
}>();

const isDirty = ref(false);
const isBooleanInput = computed(() => props.parameter.baseType === 'bool');
const isAddressInput = computed(() => props.parameter.baseType === 'address');
const isNumberInput = computed(() => props.parameter.baseType.includes('int'));
const isBytesInput = computed(() => props.parameter.baseType === 'bytes');
const isBytes32Input = computed(() => props.parameter.baseType === 'bytes32');
const isArrayInput = computed(
  () =>
    props.parameter.baseType === 'array' || props.parameter.baseType === 'tuple'
);

const inputType = computed(() => {
  if (isBooleanInput.value) return 'boolean';
  if (isAddressInput.value) return 'address';
  if (isNumberInput.value) return 'number';
  if (isBytesInput.value) return 'bytes';
  if (isBytes32Input.value) return 'bytes32';
  if (isArrayInput.value) return 'array';
  return 'text';
});

// function name may be null or empty string
const label = `${
  props.parameter.name?.length ? props.parameter.name + ' ' : ''
}(${props.parameter.type})`;
const arrayPlaceholder = `E.g. ["text", 123, 0x123]`;
const newValue = ref(props.value);

const validationState = ref(true);
const isInputValid = computed(() => validationState.value);

const validationErrorMessage = ref<string>();
const errorMessageForDisplay = computed(() => {
  if (!isInputValid.value) {
    return validationErrorMessage.value
      ? validationErrorMessage.value
      : `Invalid ${props.parameter.baseType}`;
  }
});

const allowQuickFixForBytes32 = computed(() => {
  if (errorMessageForDisplay?.value?.includes('short')) {
    return true;
  }
  return false;
});

function validate() {
  if (!isDirty.value) return true;
  if (isAddressInput.value) return isAddress(newValue.value);
  if (isArrayInput.value) return validateArrayInput(newValue.value);
  if (isNumberInput.value) return validateNumberInput(newValue.value);
  if (isBytes32Input.value) return validateBytes32Input(newValue.value);
  if (isBytesInput.value) return validateBytesInput(newValue.value);
  return true;
}

watch(props.parameter, () => {
  newValue.value = '';
  isDirty.value = false;
});

watch(newValue, () => {
  const valid = validate();
  if (valid) {
    validationErrorMessage.value = undefined;
  }
  validationState.value = valid;
  emit('updateParameterValue', newValue.value);
});

function validateNumberInput(value: string) {
  return isBigNumberish(value);
}

function validateBytesInput(value: string) {
  return isBytesLike(value);
}

// provide better feedback/validation messages for bytes32 inputs
function validateBytes32Input(value: string) {
  try {
    const data = value?.slice(2) || '';

    if (data.length < 64) {
      const padded = hexZeroPad(value, 32);
      if (isBytesLikeSafe(padded)) {
        validationErrorMessage.value = 'Value too short';
        return false;
      }
    }

    if (data.length > 64) {
      validationErrorMessage.value = 'Value too long';
      return false;
    }
    if (!isBytesLikeSafe(value)) {
      validationErrorMessage.value = undefined;
      return false;
    }
    return true;
  } catch {
    validationErrorMessage.value = undefined;
    return false;
  }
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

function formatBytes32() {
  if (isBytes32Input) {
    newValue.value = hexZeroPad(newValue.value, 32);
  }
}
onMounted(() => {
  if (props.validateOnMount) {
    isDirty.value = true;
  }
  validationState.value = validate();
});
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
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="inputType === 'number'"
    placeholder="123456"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="inputType === 'bytes'"
    placeholder="0x123abc"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="inputType === 'bytes32'"
    placeholder="0x123abc"
    :error="errorMessageForDisplay"
    :model-value="value"
    :quick-fix="allowQuickFixForBytes32 ? formatBytes32 : undefined"
    @blur="formatBytes32"
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
