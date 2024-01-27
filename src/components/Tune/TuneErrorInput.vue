<script setup lang="ts">
defineProps<{
  error?: string;
}>();
</script>

<template>
  <div :class="['tune-error-text mt-[2px]']">
    <slot v-if="$slots.error" name="error" />
    <template v-else>
      {{ error }}
    </template>
  </div>
</template>
