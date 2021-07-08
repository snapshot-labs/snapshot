<template>
  <TextareaAutosize v-model="input" />
</template>

<script>
import { ref, watch } from 'vue';

export default {
  props: {
    modelValue: Array
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const input = ref('');

    function handleInput() {
      const inputString = input.value
        .replace(/\n/g, ' ')
        .replace(/,/g, ' ')
        .replace(/;/g, ' ')
        .split(' ')
        .map(item => item.trim())
        .filter(item => !!item);
      emit('update:modelValue', inputString);
    }

    watch(input, () => handleInput());

    if (props.modelValue) input.value = props.modelValue.join('\n');

    return { input, handleInput };
  }
};
</script>
