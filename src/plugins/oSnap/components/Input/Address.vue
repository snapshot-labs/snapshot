<script setup lang="ts">
import { mustBeEthereumAddress } from '../../utils';

const props = defineProps<{
  modelValue: string;
  label: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const input = ref('');
const dirty = ref(false);
const error = computed(() => {
  if (!dirty.value) return '';
  if (input.value === '') return 'Address is required';
  if (!mustBeEthereumAddress(input.value)) return 'Invalid address';
  return '';
});

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
</script>

<template>
  <UiInput
    v-model="input"
    :disabled="disabled"
    :error="error !== '' && error"
    @input="handleInput()"
    @blur="dirty = true"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
