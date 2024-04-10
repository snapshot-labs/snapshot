<script setup lang="ts">
import { ParamType } from '@ethersproject/abi';
import AddressInput from './Address.vue';
import { hexZeroPad } from '@ethersproject/bytes';
import { isBytesLikeSafe } from '../../utils';
import {
  InputTypes,
  validateArrayInput,
  validateInput,
  validateTupleInput
} from '../../utils';

const props = defineProps<{
  parameter: ParamType;
  value: string;
  validateOnMount?: boolean;
}>();

const emit = defineEmits<{
  updateParameterValue: [value: string];
}>();

const isDirty = ref(false);

const placeholders = {
  string: 'a string of text',
  address: '0x123...abc',
  int: '123456',
  bytes: '0x123abc',
  bytes32: '0x123abc',
  bool: 'true'
} as const;

function reduceInt(type: string) {
  if (type.includes('int')) {
    return 'int';
  }
  return type;
}

const inputType = computed(() => {
  const baseType = props.parameter.baseType;

  if (baseType === 'array') {
    if (props.parameter.type.includes('tuple')) {
      return {
        input: 'tuple',
        type: props.parameter.components.map(
          item => reduceInt(item.baseType) as InputTypes
        )
        // ["string","int","address"]
      } as const;
    } else {
      return {
        input: 'array',
        type: reduceInt(props.parameter.arrayChildren.baseType) as InputTypes
      } as const;
    }
  }

  return { type: reduceInt(baseType) as InputTypes, input: 'single' } as const;
});

const isBooleanInput = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'bool'
);
const isStringInput = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'string'
);
const isAddressInput = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'address'
);
const isNumberInput = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'int'
);
const isBytesInput = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'bytes'
);
const isBytes32Input = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'bytes32'
);
const isArrayInput = computed(() => inputType.value.input !== 'single');

// param name may be null or empty string
const paramName = `${
  props.parameter.name?.length ? props.parameter.name + ' ' : ''
}`;
const paramType = computed(() => {
  if (inputType.value.input === 'single') {
    return `(${inputType.value.type})`;
  }
  return `( ${inputType.value.type}[ ] )`;
});

const label = paramName + paramType.value;

const arrayPlaceholder = computed(() => {
  if (inputType.value.input === 'array') {
    return `E.g. [${placeholders[inputType.value.type]}]`;
  }
  if (inputType.value.input === 'tuple') {
    return `E.g. [${inputType.value.type.map(type => placeholders[type])}]`;
  }
});

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
  if (inputType.value.input === 'array') {
    return validateArrayInput(newValue.value, inputType.value.type);
  }
  if (inputType.value.input === 'tuple') {
    return validateTupleInput(newValue.value, inputType.value.type);
  }
  return validateInput(newValue.value, inputType.value.type);
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

// provide better feedback/validation messages for bytes32 inputs
watch(newValue, value => {
  if (isBytes32Input.value && !isArrayInput.value) {
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
  <UiInput
    v-if="isArrayInput"
    :placeholder="arrayPlaceholder"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiSelect
    v-if="isBooleanInput"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
    <option :value="true">true</option>
    <option :value="false">false</option>
  </UiSelect>

  <AddressInput
    v-if="isAddressInput"
    :label="label"
    :model-value="value"
    @update:model-value="onChange($event)"
  />

  <UiInput
    v-if="isNumberInput"
    :placeholder="placeholders.int"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="isBytesInput"
    :placeholder="placeholders.bytes"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="isBytes32Input"
    :placeholder="placeholders.bytes"
    :error="errorMessageForDisplay"
    :model-value="value"
    :quick-fix="allowQuickFixForBytes32 ? formatBytes32 : undefined"
    @blur="formatBytes32"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="isStringInput"
    :placeholder="placeholders.string"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
</template>
