<script>
import { parseUnits, formatUnits } from '@ethersproject/units';

export default {
  props: ['modelValue', 'inputProps', 'label', 'disabled', 'decimals'],
  emits: ['update:modelValue', 'valid'],
  data() {
    return { input: '0', isValid: true, dirty: false };
  },
  mounted() {
    if (this.modelValue) {
      this.input = formatUnits(this.modelValue, this.decimals);
    }
  },
  watch: {
    modelValue(value) {
      if (value && this.disabled) {
        this.input = formatUnits(value, this.decimals);
      }
    },
    decimals() {
      this.handleInput();
    }
  },
  methods: {
    handleInput() {
      this.dirty = true;
      const value = this.format(this.input);
      this.isValid = !!value;
      this.$emit('update:modelValue', value);
    },
    format(amount) {
      try {
        return parseUnits(amount, this.decimals).toString();
      } catch (error) {
        return undefined;
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
    :error="dirty && !isValid && 'Invalid Amount'"
    @input="handleInput()"
  >
    <template v-if="label" v-slot:label>{{ label }}</template>
  </UiInput>
</template>
