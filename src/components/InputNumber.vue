<template>
  <input
    v-model="input"
    @input="handleInput"
    type="number"
    class="input width-full"
  />
</template>

<script>
export default {
  props: {
    modelValue: Number
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
      if (!this.input) return this.$emit('update:modelValue', undefined);
      this.$emit('update:modelValue', parseFloat(this.input));
    }
  }
};
</script>
