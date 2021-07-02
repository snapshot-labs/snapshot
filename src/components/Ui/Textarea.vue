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
import { ref, onMounted, toRefs, watch } from 'vue';
export default {
  props: {
    modelValue: String,
    textareaProps: String,
    error: String,
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const input = ref('');
    const { modelValue } = toRefs(props);

    function handleInput() {
      emit('update:modelValue', input.value);
    }

    onMounted(() => {
      if (props.modelValue) input.value = props.modelValue;
    });

    watch(modelValue, value => (input.value = value));

    return { input, handleInput };
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
