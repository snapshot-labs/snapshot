<template>
  <UiInput
    v-model="input"
    v-bind="inputProps"
    :error="dirty && !isValid && 'Invalid Address'"
    @input="handleInput()"
  >
    <template v-if="label" v-slot:label>
      <span class="text-black">{{ label }}</span>
    </template>
  </UiInput>
</template>

<script>
import { mustBeEthereumAddress } from '@/helpers/abi/utils';

export default {
  props: ['modelValue', 'inputProps', 'label'],
  emits: ['update:modelValue', 'validAddress'],
  data() {
    return { input: '', isValid: false, dirty: false };
  },
  mounted() {
    if (this.modelValue) return (this.input = this.modelValue);
  },
  watch: {
    modelValue(value) {
      this.input = value;
    }
  },
  methods: {
    handleInput() {
      this.dirty = true;
      this.$emit('update:modelValue', this.input);
      this.isValid = mustBeEthereumAddress(this.input);
      if (this.isValid) {
        this.$emit('validAddress', this.input);
      }
    }
  }
};
</script>

<style scoped></style>
