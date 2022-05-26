<script setup>
const props = defineProps({
  space: Object,
  size: {
    type: Number,
    default: 22
  }
});
</script>

<template>
  <img
    :src="`https://stamp.fyi/space/${space.id}?s=${size * 2}`"
    class="rounded-full inline-block align-middle leading-none"
    :class="'bg-[color:var(--border-color)]'"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  />
</template>
