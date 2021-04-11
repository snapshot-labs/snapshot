<template>
  <UiButton :warning="warning" class="text-left width-full mb-2 d-flex px-3">
    <div class="text-gray mr-2">{{ $t(`settings.${name}`) }}</div>
    <div v-if="button" class="flex-auto"><slot /></div>
    <input
      v-else
      :value="modelValue"
      @input="handleInput"
      class="input flex-auto"
      required
    />
    <Icon
      v-if="warning"
      name="warning"
      color="red"
      size="18"
      class="text-gray p-1 d-block pt-2 mt-1 mr-n1"
    />
  </UiButton>
</template>

<script>
export default {
  props: {
    warning: Boolean,
    name: String,
    button: Boolean,
    modelValue: String || Number
  },
  emits: ['update:modelValue'],
  methods: {
    handleInput(e) {
      const input = e.target.value;
      this.$emit('update:modelValue', input);
    }
  }
};
</script>
