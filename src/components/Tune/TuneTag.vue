<script setup lang="ts">
defineProps<{
  label: string | number;
}>();
</script>

<template>
  <span class="tune-tag">
    {{ label }}
  </span>
</template>
