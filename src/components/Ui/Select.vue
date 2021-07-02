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
  props: { modelValue: String, disabled: Boolean },
  emits: ['update:modelValue', 'change'],
  setup(_, { emit }) {
    function handleChange(event) {
      emit('update:modelValue', event.target.value);
      emit('change', event.target.value);
    }

    return { handleChange };
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
