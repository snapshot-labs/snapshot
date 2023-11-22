<script setup lang="ts">
defineProps<{ value: number }>();
</script>

<template>
  <div class="relative mt-1 flex h-2 overflow-hidden rounded-full">
    <div class="z-5 absolute h-full w-full bg-[color:var(--border-color)]" />
    <div
      :style="`width: ${value.toFixed(3)}%;`"
      class="z-10 h-full bg-primary opacity-80"
    />
  </div>
</template>
