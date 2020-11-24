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
    value: Number
  },
  data() {
    return {
      input: ''
    };
  },
  created() {
    if (this.value) this.input = this.value.toString();
  },
  methods: {
    handleInput() {
      if (!this.input) return this.$emit('input', undefined);
      this.$emit('input', parseFloat(this.input));
    }
  }
};
</script>
