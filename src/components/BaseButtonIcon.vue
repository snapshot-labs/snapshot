<script setup lang="ts">
defineProps<{
  loading?: boolean;
  isDisabled?: boolean;
}>();
</script>

<template>
  <button
    :disabled="isDisabled"
    :class="{ '!cursor-not-allowed': isDisabled }"
    class="flex items-center rounded-full p-[6px] text-md text-skin-text transition-colors duration-200 hover:text-skin-link"
  >
    <LoadingSpinner v-if="loading" />
    <slot v-else />
  </button>
</template>
