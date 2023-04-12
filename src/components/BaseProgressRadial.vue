<script setup lang="ts">
defineProps<{ value: number }>();
</script>

<template>
  <div
    :style="{
      backgroundImage: `conic-gradient(var(--text-color) ${value}%, transparent 0)`
    }"
    class="circle"
  ></div>
</template>

<style scoped>
.circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--text-color);
}
</style>
