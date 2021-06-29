<template>
  <UiButton class="width-full mb-2 px-3 d-flex overflow-hidden">
    <div class="text-gray mr-2 no-shrink">
      <slot name="label" />
    </div>
    <div v-if="$slots.image" class="text-gray mr-2 no-shrink">
      <slot name="image" />
    </div>
    <select
      :disabled="disabled"
      :value="modelValue"
      @change="handleChange($event)"
      v-bind:class="{ disabled }"
      class="input flex-auto height-full width-full"
    >
      <slot />
    </select>
  </UiButton>
</template>

<script>
export default {
  props: ['modelValue', 'disabled'],
  emits: ['update:modelValue', 'change'],
  methods: {
    handleChange(event) {
      this.$emit('update:modelValue', event.target.value);
      this.$emit('change', event.target.value);
    }
  }
};
</script>

<style scoped lang="scss">
.no-shrink {
  flex-shrink: 0;
}
.disabled {
  appearance: none;
}
</style>
