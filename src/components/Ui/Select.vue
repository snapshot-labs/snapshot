<script setup lang="ts">
defineProps<{ modelValue?: string | number; disabled?: boolean }>();

const emit = defineEmits(['update:modelValue', 'change']);

function handleChange(event) {
  emit('update:modelValue', event.target.value);
  emit('change', event.target.value);
}
</script>

<template>
  <BaseButton class="mb-2 flex w-full items-center overflow-hidden !px-3">
    <div class="mr-2 shrink-0 text-skin-text">
      <slot name="label" />
    </div>
    <div v-if="$slots.image" class="mr-2 shrink-0 text-skin-text">
      <slot name="image" />
    </div>
    <select
      :disabled="disabled"
      :value="modelValue"
      :class="{ 'appearance-none': disabled }"
      class="input h-full w-full flex-auto"
      @change="handleChange($event)"
    >
      <slot />
    </select>
  </BaseButton>
</template>
