<script setup lang="ts">
import { formatUnits, parseUnits } from '@ethersproject/units';

const props = defineProps<{
  modelValue: string;
  label: string;
  decimals: number | undefined;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

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
  emit('update:modelValue', value ?? '');
};

onMounted(() => {
  if (props.modelValue) {
    input.value = formatUnits(props.modelValue, props.decimals);
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
