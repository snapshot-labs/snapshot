<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <button
    class="relative w-full border-y border-skin-border p-4 py-[18px] pr-[80px] text-left hover:border-skin-text md:rounded-xl md:border-x"
  >
    <h4 class="leading-2 mb-1 mt-0">{{ title }}</h4>
    <slot />
    <i-ho-chevron-right class="absolute right-4 top-[calc(50%-17px)] text-xl" />
  </button>
</template>
