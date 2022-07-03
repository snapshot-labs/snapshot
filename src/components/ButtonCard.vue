<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <button
    class="relative rounded-xl border p-4 py-[18px] pr-[80px] text-left hover:border-skin-text"
  >
    <h3 class="mt-0 leading-6">{{ title }}</h3>
    <slot />
    <i-ho-chevron-right class="absolute top-[42px] right-4 text-xl" />
  </button>
</template>
