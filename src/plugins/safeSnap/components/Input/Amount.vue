<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue';

const props = defineProps({
  modelValue: String,
  inputProps: Object,
  label: String,
  disabled: Boolean,
  decimals: Number
});

const emit = defineEmits(['update:modelValue', 'valid']);

const input = ref('');
const isValid = ref(true);
const dirty = ref(false);

const format = (amount: string, decimals: number) => {
  try {
    return parseUnits(amount, decimals).toString();
  } catch (error) {
    console.error('Error formatting amount:', error);
    return undefined;
  }
};

const handleInput = () => {
  dirty.value = true;
  if (input.value !== '') {
    const formattedValue = format(input.value, props.decimals ?? 18);
    if (formattedValue !== undefined) {
      isValid.value = true;
      emit('update:modelValue', formattedValue);
    } else {
      isValid.value = false;
    }
  }
};

watch(
  [() => props.decimals, () => props.modelValue],
  ([newDecimals, newModelValue], [oldDecimals]) => {
    if (newModelValue && newDecimals !== oldDecimals) {
      try {
        const bigNumberValue = BigNumber.from(newModelValue);
        const valueInNewDecimals = formatUnits(bigNumberValue, newDecimals);
        input.value = valueInNewDecimals;
        handleInput(); // Actualiza basado en el nuevo valor
      } catch (error) {
        console.error('Error adjusting for new decimals:', error);
        isValid.value = false;
      }
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  if (props.modelValue) {
    try {
      const modelValueBigNumber = BigNumber.from(props.modelValue);
      input.value = formatUnits(modelValueBigNumber, props.decimals);
    } catch (error) {
      console.error('Error setting initial value:', error);
      isValid.value = false;
    }
  }
});
</script>

<template>
  <UiInput
    :custom-styles="'safesnap-custom-input'"
    v-model="input"
    v-bind="inputProps"
    :disabled="disabled"
    :error="dirty && !isValid && $t('safeSnap.invalidAmount')"
    @input="handleInput()"
  >
    <template v-slot:label>{{ label }}</template>
  </UiInput>
</template>
