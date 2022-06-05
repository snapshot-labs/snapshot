<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <button
    class="text-skin-text hover:text-skin-link text-md flex items-center rounded-full p-[6px]"
  >
    <LoadingSpinner v-if="loading" />
    <slot v-else />
  </button>
</template>
