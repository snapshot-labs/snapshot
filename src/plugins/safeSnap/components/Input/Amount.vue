<script setup lang="ts">
import { parseUnits, formatUnits } from '@ethersproject/units';
import { onMounted, ref, watch } from 'vue';

const props = defineProps([
  'modelValue',
  'inputProps',
  'label',
  'disabled',
  'decimals'
]);
const emit = defineEmits(['update:modelValue', 'valid']);

const input = ref('0');
const isValid = ref(true);
const dirty = ref(false);

const format = (amount: string) => {
  try {
    return parseUnits(amount, props.decimals).toString();
  } catch (error) {
    return undefined;
  }
};

const handleInput = () => {
  dirty.value = true;
  const value = format(input.value);
  isValid.value = !!value;
  emit('update:modelValue', value);
};

onMounted(() => {
  if (props.modelValue) {
    input.value = formatUnits(props.modelValue, props.decimals);
  }
});

watch(
  () => props.modelValue,
  value => {
    if (value && props.disabled) {
      input.value = formatUnits(value, props.decimals);
    }
  }
);

watch(
  () => props.decimals,
  () => {
    handleInput();
  }
);
</script>

<template>
  <UiInput
    v-model="input"
    v-bind="inputProps"
    :disabled="disabled"
    :error="dirty && !isValid && $t('safeSnap.invalidAmount')"
    @input="handleInput()"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
