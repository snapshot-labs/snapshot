<template>
  <textarea
      class="input width-full textarea"
      v-model="input"
  ></textarea>
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  data() {
    return {
      input: ''
    };
  },
  created() {
    if (this.modelValue) this.input = this.modelValue;
  },
}
</script>

<style scoped lang="scss">
.textarea {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  padding: 0 24px;
  outline: none;
  font-size: 14px;

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }
}
</style>
