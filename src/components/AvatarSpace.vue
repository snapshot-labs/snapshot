<script setup lang="ts">
import { withDefaults } from 'vue';

withDefaults(
  defineProps<{
    space: { id: string };
    size?: string;
  }>(),
  {
    size: '22'
  }
);
</script>

<template>
  <img
    :src="`https://stamp.fyi/space/${space.id}?s=${Number(size) * 2}`"
    class="rounded-full inline-block align-middle leading-none"
    :class="'bg-[color:var(--border-color)]'"
    :style="{
      width: `${Number(size)}px`,
      height: `${Number(size)}px`
    }"
  />
</template>
