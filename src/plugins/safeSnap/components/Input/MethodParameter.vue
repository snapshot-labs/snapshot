<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { isAddress } from '@ethersproject/address';
import { isArrayParameter, isStringArray } from '@/plugins/safeSnap/utils/abi';
import SafeSnapInputAddress from './Address.vue';
import SafeSnapInputArrayType from './ArrayType.vue';
import { ParamType } from '@ethersproject/abi';

const props = defineProps<{
  modelValue: string;
  parameter: ParamType;
  disabled: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

const placeholder = computed(() =>
  props.parameter.name
    ? `${props.parameter.name} (${props.parameter.type})`
    : props.parameter.type
);

const input = ref<string | boolean>(
  props.parameter.type === 'bool' ? false : ''
);
const dirty = ref(false);

const isValid = computed(() => {
  if (props.parameter.baseType === 'address') {
    return isAddress(input.value as string);
  } else if (isArrayParameter(props.parameter.baseType)) {
    return isStringArray(input.value as string);
  }
  return !!input.value;
});

onMounted(() => {
  if (props.modelValue) {
    input.value = props.modelValue;
  }
});

const handleInput = value => {
  input.value = value;
  dirty.value = true;
  emit('update:modelValue', input.value);
};
</script>

<template>
  <UiSelect
    v-if="parameter.type === 'bool'"
    :disabled="disabled"
    :model-value="input"
    @update:modelValue="handleInput($event)"
  >
    <template #label>{{ placeholder }}</template>
    <option :value="true">true</option>
    <option :value="false">false</option>
  </UiSelect>

  <!-- ADDRESS -->
  <SafeSnapInputAddress
    v-else-if="parameter.type === 'address'"
    :disabled="disabled"
    :input-props="{ required: true }"
    :label="placeholder"
    :model-value="input"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <SafeSnapInputArrayType
    v-else-if="isArrayParameter(parameter.baseType)"
    :disabled="disabled"
    :model-value="input"
    :parameter="parameter"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :disabled="disabled"
    :error="dirty && !isValid && `Invalid ${parameter.type}`"
    :model-value="(input as string)"
    @update:modelValue="handleInput($event)"
  >
    <template #label>{{ placeholder }}</template>
  </UiInput>
</template>
