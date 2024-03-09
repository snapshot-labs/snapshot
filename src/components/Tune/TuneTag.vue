<script setup lang="ts">
defineProps<{
  label?: string | number;
}>();
</script>

<template>
  <span class="tune-tag">
    <slot v-if="$slots.default" />
    {{ label }}
  </span>
</template>
