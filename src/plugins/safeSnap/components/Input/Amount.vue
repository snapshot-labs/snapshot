<script setup lang="ts">
import { parseUnits, formatUnits } from '@ethersproject/units';

const props = defineProps([
  'modelValue',
  'inputProps',
  'label',
  'disabled',
  'decimals',
  'isDetails'
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
    if (value !== undefined) {
      input.value = formatUnits(value, props.decimals);
    }
  },
  { immediate: true }
);

watch(
  () => props.decimals,
  () => {
    handleInput();
  }
);
</script>

<template>
  <p v-if="props.isDetails">
    {{ input }}
  </p>
  <UiInput
    v-if="!props.isDetails"
    :custom-styles="'safesnap-custom-input'"
    v-model="input"
    v-bind="inputProps"
    :disabled="disabled"
    :error="dirty && !isValid && $t('safeSnap.invalidAmount')"
    @input="handleInput()"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
