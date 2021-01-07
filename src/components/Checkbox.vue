<template>
  <input v-model="input" @input="handleInput" />
</template>

<script>
export default {
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  data() {
    return {
      input: ''
    };
  },
  created() {
    if (this.modelValue) this.input = this.modelValue.toString();
  },
  methods: {
    handleInput() {
      const value = ['1', 'yes', 'ok', 'true'].includes(
        this.input.trim().toLowerCase()
      );
      this.$emit('update:modelValue', value);
    }
  }
};
</script>
