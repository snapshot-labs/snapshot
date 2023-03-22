<script setup lang="ts">
defineProps<{
  isDisabled?: boolean;
}>();
</script>

<template>
  <button
    :disabled="isDisabled"
    :class="{ '!cursor-not-allowed': isDisabled }"
    class="flex h-[44px] w-[44px] cursor-pointer select-none items-center justify-center rounded-full border hover:border-skin-text"
  >
    <slot />
  </button>
</template>
