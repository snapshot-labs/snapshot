<script setup lang="ts">
defineProps<{
  slim?: boolean;
}>();
</script>

<template>
  <div
    class="border-y border-skin-border bg-skin-block-bg md:rounded-2xl md:border"
  >
    <slot name="title" />
    <div class="p-3" :class="{ '!p-0': slim }">
      <slot />
    </div>
  </div>
</template>
