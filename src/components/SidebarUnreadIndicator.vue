<script setup lang="ts">
defineProps<{ space: string; hasUnseen: boolean }>();
</script>

<template>
  <div
    :class="[
      $route.params.key === space
        ? '!h-[20px] bg-skin-link'
        : hasUnseen
        ? 'bg-skin-text group-hover:h-[10px]'
        : 'group-hover:h-[10px] '
    ]"
    class="absolute left-[-4px] h-[8px] w-[8px] rounded-full transition-all duration-300 group-hover:bg-skin-link"
  />
</template>
