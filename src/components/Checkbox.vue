<template>
  <input v-model="input" @input="handleInput" />
</template>

<script>
export default {
  props: {
    value: Boolean
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
      const value = ['1', 'yes', 'ok', 'true'].includes(
        this.input.trim().toLowerCase()
      );
      this.$emit('input', value);
    }
  }
};
</script>
