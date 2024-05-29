<script setup lang="ts">
import { mustBeEthereumAddress } from '../../utils';

const props = defineProps<{
  modelValue: string;
  label: string;
  error?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const input = ref('');
const dirty = ref(false);
const error = ref('');

const validate = () => {
  if (!dirty.value) {
    error.value = '';
    return;
  }
  if (input.value === '') {
    error.value = 'Address is required';
    return;
  }

  if (!mustBeEthereumAddress(input.value)) {
    error.value = 'Invalid address';
    return;
  }
  error.value = '';
};

watch(input, validate);

watch(
  () => props.modelValue,
  value => {
    input.value = value;
  }
);

onMounted(() => {
  if (props.modelValue) {
    input.value = props.modelValue;
  }
});

const handleInput = () => {
  emit('update:modelValue', input.value);
};

const handleBlur = () => {
  dirty.value = true;
  validate();
};
</script>

<template>
  <UiInput
    v-model="input"
    :disabled="disabled"
    placeholder="0x123...abc"
    :error="props.error ?? (error || '')"
    @input="handleInput()"
    @blur="handleBlur"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
