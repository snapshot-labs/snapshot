<script>
import { mustBeEthereumAddress } from '../../index';

export default {
  props: ['modelValue', 'inputProps', 'label', 'disabled'],
  emits: ['update:modelValue', 'validAddress'],
  data() {
    return { input: '', isValid: false, dirty: false };
  },
  watch: {
    modelValue(value) {
      this.input = value;
    }
  },
  mounted() {
    if (this.modelValue) return (this.input = this.modelValue);
  },
  methods: {
    handleInput() {
      this.dirty = this.input !== '';
      this.$emit('update:modelValue', this.input);
      this.isValid = mustBeEthereumAddress(this.input);
      if (this.isValid) {
        this.$emit('validAddress', this.input);
      }
    }
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
