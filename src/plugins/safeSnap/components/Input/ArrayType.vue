<script setup lang="ts">
import { computed, ref } from 'vue';
import { ParamType } from '@ethersproject/abi';
import { isStringArray } from '../../utils/abi';

const props = defineProps<{
  parameter: ParamType;
}>();

const getPlaceholder = (type: string) => {
  if (type.startsWith('address')) {
    return 'E.g.: ["0xACa9...DA6E","0x1dF6...006e"]';
  }

  if (type.startsWith('bool')) {
    return 'E.g.: [true, false, false, true]';
  }

  if (type.startsWith('uint')) {
    return 'E.g.: [1000, 212, 320000022, 23]';
  }

  if (type.startsWith('int')) {
    return 'E.g.: [1000, -212, 1232, -1]';
  }

  if (type.startsWith('bytes')) {
    return 'E.g.: ["0xc00000000000000000000000000000000000", "0xc00000000000000000000000000000000001"]';
  }

  if (type.startsWith('tuple')) {
    return 'E.g.: [["first value", "second value"], ["first value", "second value"]]';
  }

  return 'E.g.: ["first value", "second value", "third value"]';
};

function getLabel(parameter: ParamType) {
  let type = parameter.type;
  if (parameter.baseType === 'tuple') {
    const components = parameter.components.map(param => param.type).join(', ');
    type = `${type}(${components})`;
  }
  if (parameter.name) return `${parameter.name} (${type})`;
  return type;
}

const label = getLabel(props.parameter);
const placeholder = getPlaceholder(props.parameter.type);

const input = ref('');
const dirty = ref(false);

const isValid = computed(() => isStringArray(input.value));

const handleInput = (value: string) => {
  input.value = value;
  dirty.value = true;
};
</script>

<template>
  <UiInput
    :error="dirty && !isValid && `Invalid ${parameter.type}`"
    :model-value="input"
    :placeholder="placeholder"
    @update:modelValue="handleInput($event)"
  >
    <template #label>{{ label }}</template>
  </UiInput>
</template>
