<script setup lang="ts">
import { computed, ref, onMounted, watch, toRef } from 'vue';
import { isParameterValue } from '../../utils/validator';
import { isArrayParameter } from '../../index';
import SafeSnapInputAddress from './Address.vue';
import SafeSnapInputArrayType from './ArrayType.vue';

const props = defineProps<{
  modelValue: string;
  disabled: boolean;
  parameter: { name: string; type: string; baseType: string };
}>();

const emit = defineEmits(['update:modelValue', 'isValid']);

const placeholder = computed(() => {
  return props.parameter.name
    ? `${props.parameter.name} (${props.parameter.type})`
    : props.parameter.type;
});

let input = ref<string>('');
if (props.modelValue) input = toRef(props, 'modelValue');

const value = ref<string | boolean>(false);
const dirty = ref(false);

const isValid = computed(() => {
  if (typeof value.value === 'boolean') return true;
  return isParameterValue(props.parameter.baseType, value.value);
});

const handleInput = value => {
  value.value = value;
  dirty.value = true;
  emit('update:modelValue', value);
  emit('isValid', isValid.value);
};

const isArrayType = () => {
  return isArrayParameter(props.parameter.baseType);
};

onMounted(() => {
  if (props.modelValue) value.value = props.modelValue;
  if (props.parameter.type === 'bool') value.value = false;
});

watch(
  () => props.modelValue,
  value => {
    input.value = value;
  }
);
</script>

<template>
  <UiSelect
    v-if="parameter.type === 'bool'"
    :disabled="disabled"
    :model-value="(value as string)"
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
    :model-value="value"
    @update:modelValue="handleInput($event)"
  />
  <!-- Array of X type -->
  <SafeSnapInputArrayType
    v-else-if="isArrayType()"
    :disabled="disabled"
    :model-value="value"
    :parameter="parameter"
    @update:modelValue="handleInput($event)"
  />
  <!-- Text input -->
  <UiInput
    v-else
    :disabled="disabled"
    :error="dirty && !isValid && `Invalid ${parameter.type}`"
    :model-value="(value as string)"
    @update:modelValue="handleInput($event)"
  >
    <template #label>{{ placeholder }}</template>
  </UiInput>
</template>
