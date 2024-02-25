<script setup lang="ts">
defineProps<{
  slim?: boolean;
}>();
</script>

<template>
  <div class="border-skin-border bg-skin-block-bg rounded-2xl border">
    <slot name="header" />
    <div class="p-3" :class="{ '!p-0': slim }">
      <slot />
    </div>
  </div>
</template>
