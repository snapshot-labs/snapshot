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
  <BaseAvatar
    :size="size"
    :src="`https://stamp.fyi/space/${space.id}?s=${Number(size) * 2}`"
  />
</template>
