<script>
export default {
  props: {
    modelValue: [String, Number],
    placeholder: String,
    error: String,
    number: Boolean,
    disabled: Boolean
  },
  emits: ['update:modelValue'],
  methods: {
    handleInput(e) {
      const input = e.target.value;
      if (this.number) {
        return this.$emit(
          'update:modelValue',
          !input ? undefined : parseFloat(input)
        );
      }
      this.$emit('update:modelValue', input);
    }
  }
};
</script>

<template>
  <UiButton
    class="text-left width-full mb-2 d-flex px-3"
    :class="{ 'border-red': error }"
  >
    <div class="text-gray mr-2">
      <slot name="label" />
    </div>
    <div v-if="$slots.selected" class="flex-auto"><slot name="selected" /></div>
    <input
      v-else
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :type="number ? 'number' : 'text'"
      :disabled="disabled"
      class="input flex-auto"
      required
    />
    <slot name="info" />
    <span
      v-if="error"
      :aria-label="error"
      class="float-right text-white tooltipped tooltipped-n"
      ><Icon name="warning" class="text-red p-1 d-block pt-2 mt-1 mr-n1"
    /></span>
  </UiButton>
</template>
