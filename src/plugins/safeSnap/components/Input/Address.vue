<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { mustBeEthereumAddress } from '../../index';

const props = defineProps(['modelValue', 'inputProps', 'label', 'disabled']);
const emit = defineEmits(['update:modelValue', 'validAddress']);

const input = ref('');
const isValid = ref(false);
const dirty = ref(false);

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
  dirty.value = input.value !== '';
  emit('update:modelValue', input.value);
  isValid.value = mustBeEthereumAddress(input.value);
  if (isValid.value) {
    emit('validAddress', input.value);
  }
};
</script>

<template>
  <UiInput
    v-model="input"
    v-bind="inputProps"
    :disabled="disabled"
    :error="dirty && !isValid && $t('safeSnap.invalidAddress')"
    @input="handleInput()"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
