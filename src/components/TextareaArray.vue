<template>
  <textarea-autosize @input="handleInput" v-model="input" />
</template>

<script>
export default {
  props: {
    value: Array
  },
  data() {
    return {
      input: ''
    };
  },
  created() {
    if (this.value) this.input = this.value.join('\n');
  },
  methods: {
    handleInput() {
      const input = this.input
        .replace(/\n/g, ' ')
        .replace(/,/g, ' ')
        .replace(/;/g, ' ')
        .split(' ')
        .map(item => item.trim())
        .filter(item => !!item);
      this.$emit('input', input);
    }
  }
};
</script>
