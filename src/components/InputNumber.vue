<template>
  <input
    v-model="input"
    @input="handleInput"
    type="number"
    class="input width-full"
  />
</template>

<script>
import { ref } from 'vue';
export default {
  props: {
    modelValue: Number
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const input = ref('');

    function handleInput() {
      if (!input.value) return emit('update:modelValue', undefined);
      emit('update:modelValue', parseFloat(input.value));
    }

    if (props.modelValue) input.value = props.modelValue.toString();

    return { input, handleInput };
  }
};
</script>
