<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div>
    <span class="text-skin-link text-xs px-4 md:px-0">{{
      title.toUpperCase()
    }}</span>
    <BaseBlock slim class="my-1">
      <slot />
    </BaseBlock>
  </div>
</template>
