<script setup lang="ts">
defineProps<{
  error?: string;
}>();
</script>

<template>
  <div :class="['tune-error-text mt-[2px]']">
    {{ error }}
  </div>
</template>
