<template>
  <TextareaAutosize @update:modelValue="handleInput" v-model="input" />
</template>

<script>
export default {
  props: {
    modelValue: Array
  },
  emits: ['update:modelValue'],
  data() {
    return {
      input: ''
    };
  },
  created() {
    if (this.modelValue) this.input = this.modelValue.join('\n');
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
      this.$emit('update:modelValue', input);
    }
  }
};
</script>
