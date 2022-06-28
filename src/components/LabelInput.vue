<script setup lang="ts">
defineProps<{
  information?: string;
}>();
</script>

<template>
  <span class="mb-[2px] flex items-center gap-1 text-skin-text">
    <slot />
    <IconInformationTooltip :information="information" />
  </span>
</template>
