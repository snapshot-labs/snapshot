<script setup lang="ts">
import { ParamType } from '@ethersproject/abi';
import { hexZeroPad } from '@ethersproject/bytes';
import { ref, computed, watch, onMounted } from 'vue';
import { extractTypes, getParamLabel, getParamPlaceholder } from './utils';
import { isBytesLikeSafe, validateSingleOrArray } from '@/plugins/oSnap/utils';

const props = defineProps<{
  parameter: ParamType;
  value: string;
  validateOnMount?: boolean;
}>();

const emit = defineEmits<{
  updateParameterValue: [value: string];
}>();

const isDirty = ref(false);

const inputType = computed(() => extractTypes(props.parameter));

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
  () =>
    inputType.value.input === 'single' && inputType.value.type.includes('int')
);
const isBytesInput = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'bytes'
);
const isBytes32Input = computed(
  () => inputType.value.input === 'single' && inputType.value.type === 'bytes32'
);
const isArrayInput = computed(() => inputType.value.input !== 'single');

const label = computed(() => getParamLabel(props.parameter));
const placeholder = computed(() => getParamPlaceholder(props.parameter));

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
  return validateSingleOrArray(newValue.value, inputType.value.type);
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
        validationErrorMessage.value = 'bytes32 too short';
        return;
      }
    }

    if (data.length > 64) {
      validationErrorMessage.value = 'Value too long';
      return false;
    }

    validationErrorMessage.value = undefined;
  }
});

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
    :placeholder="placeholder"
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
    :placeholder="placeholder"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="isBytesInput"
    :placeholder="placeholder"
    :error="errorMessageForDisplay"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
  <UiInput
    v-if="isBytes32Input"
    :placeholder="placeholder"
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
    :placeholder="placeholder"
    :model-value="value"
    @update:model-value="onChange($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
</template>
