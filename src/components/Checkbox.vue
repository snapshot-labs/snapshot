<template>
  <a @click="handleToggle">
    <Icon
      :name="input ? 'toggle-on' : 'toggle_off'"
      :class="input ? 'text-green' : 'border-color'"
      size="32"
    />
  </a>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const input = ref(false);

    function handleToggle() {
      input.value = !input.value;
      emit('update:modelValue', input.value);
    }

    if (props.modelValue) input.value = props.modelValue.toString();

    return { input, handleToggle };
  }
};
</script>
