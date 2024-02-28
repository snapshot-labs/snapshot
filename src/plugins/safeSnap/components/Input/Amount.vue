<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
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
    console.error('Error formatting amount:', error);
    return undefined;
  }
};

const handleInput = () => {
  dirty.value = true;
  const formattedValue = format(input.value);
  if (formattedValue !== undefined) {
    isValid.value = true;
    emit('update:modelValue', formattedValue);
  } else {
    isValid.value = false;
  }
};

onMounted(() => {
  if (props.modelValue) {
    const modelValueBigNumber = BigNumber.from(props.modelValue);
    input.value = formatUnits(modelValueBigNumber, props.decimals);
  }
});

watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== undefined) {
      const newValueBigNumber = BigNumber.from(newValue);
      input.value = formatUnits(newValueBigNumber, props.decimals);
    }
  },
  { immediate: true }
);

watch(
  () => props.decimals,
  (newDecimals, oldDecimals) => {
    const currentInputValue = input.value;
    try {
      const currentInputInWei = parseUnits(currentInputValue, oldDecimals);
      const safeValueForNewDecimals = formatUnits(
        currentInputInWei,
        newDecimals
      );
      input.value = safeValueForNewDecimals;
      handleInput();
    } catch (error) {
      console.error('Error adjusting input value for new decimals:', error);
      isValid.value = false;
    }
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
