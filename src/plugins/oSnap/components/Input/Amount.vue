<script setup lang="ts">
import { formatUnits, parseUnits } from '@ethersproject/units';
import { amountPositive } from '../../utils';

const props = defineProps<{
  modelValue: string;
  label: string;
  decimals: number | undefined;
  enforcePositiveValue?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const input = ref('0');
const isValid = ref(true);
const dirty = ref(false);

const format = (amount: string) => {
  try {
    // empty string throws
    const parsed = parseUnits(amount, props.decimals).toString();
    return parsed;
  } catch {
    return '0';
  }
};

const handleInput = () => {
  dirty.value = true;
  const value = format(input.value);
  // empty string value will throw error being converted to BigNumber
  emit('update:modelValue', value ?? '0');
};

onMounted(() => {
  if (props.modelValue) {
    input.value = formatUnits(props.modelValue, props.decimals);
  }
});

watch(input, () => {
  const value = format(input.value);
  const valid = !!value;
  isValid.value = valid;
  if (props.enforcePositiveValue) {
    const isPositive = amountPositive(input.value, props.decimals);
    isValid.value = isPositive;
  }
});
</script>

<template>
  <UiInput
    v-model="input"
    :error="dirty && !isValid && $t('safeSnap.invalidAmount')"
    @input="handleInput()"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
