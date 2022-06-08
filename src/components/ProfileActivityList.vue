<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div>
    <span class="px-4 text-xs text-skin-link md:px-0">{{
      title.toUpperCase()
    }}</span>
    <BaseBlock slim class="my-1">
      <slot />
    </BaseBlock>
  </div>
</template>
