<script setup lang="ts">
import { withDefaults } from 'vue';
withDefaults(
  defineProps<{
    name: string;
    size?: string;
  }>(),
  {
    name: '',
    size: '16'
  }
);
</script>

<template>
  <i
    class="iconfont"
    :class="`icon${name}`"
    :style="size ? `font-size: ${size}px; line-height: ${size}px;` : ''"
  />
</template>
