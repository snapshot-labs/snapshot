<template>
  <div>
    <textarea
      v-model="input"
      v-bind="textareaProps"
      :class="{ 'border-red': error }"
      :disabled="disabled"
      class="input width-full textarea"
      @input="handleInput()"
    ></textarea>
    <span v-if="error" class="error-message">*{{ error }}</span>
  </div>
</template>

<script>
export default {
  props: ['modelValue', 'textareaProps', 'error', 'disabled'],
  emits: ['update:modelValue'],
  data() {
    return {
      input: ''
    };
  },
  created() {
    if (this.modelValue) this.input = this.modelValue;
  },
  watch: {
    modelValue(value) {
      this.input = value;
    }
  },
  methods: {
    handleInput() {
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>

<style lang="scss" scoped>
.error-message {
  color: #ff3856;
  font-size: 16px;
}

.textarea {
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--link-color);
  border-radius: 23px;
  padding: 0 24px;
  outline: none;
  font-size: 16px;

  &:hover {
    color: var(--link-color);
    border-color: var(--link-color);
  }
}
</style>
