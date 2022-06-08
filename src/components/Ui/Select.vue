<script setup>
defineProps({ modelValue: [String, Number], disabled: Boolean });

const emit = defineEmits(['update:modelValue', 'change']);

function handleChange(event) {
  emit('update:modelValue', event.target.value);
  emit('change', event.target.value);
}
</script>

<template>
  <BaseButton class="mb-2 flex w-full items-center overflow-hidden !px-3">
    <div class="no-shrink mr-2 text-skin-text">
      <slot name="label" />
    </div>
    <div v-if="$slots.image" class="no-shrink mr-2 text-skin-text">
      <slot name="image" />
    </div>
    <select
      :disabled="disabled"
      :value="modelValue"
      :class="{ disabled }"
      class="input h-full w-full flex-auto"
      @change="handleChange($event)"
    >
      <slot />
    </select>
  </BaseButton>
</template>

<style scoped lang="scss">
.no-shrink {
  flex-shrink: 0;
}
.disabled {
  appearance: none;
}
</style>
