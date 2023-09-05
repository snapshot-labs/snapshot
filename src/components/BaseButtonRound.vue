<script setup lang="ts">
withDefaults(
  defineProps<{
    isDisabled?: boolean;
    size?: string;
  }>(),
  {
    isDisabled: false,
    size: '46px'
  }
);
</script>

<template>
  <button
    :disabled="isDisabled"
    :class="{ '!cursor-not-allowed': isDisabled }"
    class="flex cursor-pointer select-none items-center justify-center rounded-full border hover:border-skin-text"
    :style="`width: ${size}; height: ${size}`"
  >
    <slot />
  </button>
</template>
