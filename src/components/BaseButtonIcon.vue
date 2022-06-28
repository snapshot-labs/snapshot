<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <button
    class="flex items-center rounded-full p-[6px] text-md text-skin-text transition-colors duration-200 hover:text-skin-link"
  >
    <LoadingSpinner v-if="loading" />
    <slot v-else />
  </button>
</template>
