<script setup lang="ts">
defineProps<{ space: string; hasUnseen: boolean }>();
</script>

<template>
  <div
    :class="[
      $route.params.key === space
        ? 'bg-skin-link !h-[20px]'
        : hasUnseen
        ? 'bg-skin-text group-hover:h-[10px]'
        : 'group-hover:h-[10px] '
    ]"
    class="w-[8px] h-[8px] transition-all duration-300 absolute left-[-4px] rounded-full group-hover:bg-skin-link"
  />
</template>
