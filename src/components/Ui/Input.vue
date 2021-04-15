<template>
  <UiButton :warning="warning" class="text-left width-full mb-2 d-flex px-3">
    <div class="text-gray mr-2">
      <slot name="label" />
    </div>
    <div v-if="$slots.selected" class="flex-auto"><slot name="selected" /></div>
    <input
      v-else
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      class="input flex-auto"
      required
    />
    <slot name="info" />
    <Icon
      v-if="warning"
      name="warning"
      size="18"
      class="text-red p-1 d-block pt-2 mt-1 mr-n1"
    />
  </UiButton>
</template>

<script>
export default {
  props: {
    warning: Boolean,
    modelValue: String || Number,
    placeholder: String
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
