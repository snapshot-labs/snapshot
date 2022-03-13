<script setup lang="ts">
import { withDefaults } from 'vue';

withDefaults(defineProps<{ space?: string; hasUnseen: boolean }>(), {
  space: ''
});
</script>

<template>
  <div
    :class="[
      $route.params.key === space
        ? 'bg-skin-link h-[24px]'
        : hasUnseen
        ? 'bg-skin-link'
        : ''
    ]"
    class="w-[8px] h-[8px] transition-all duration-500 absolute left-[-4px] rounded-full opacity-70 group-hover:opacity-100"
  />
</template>
