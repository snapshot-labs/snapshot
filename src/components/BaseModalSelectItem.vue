<script setup lang="ts">
defineProps<{
  selected?: boolean;
  title: string;
  description?: string;
}>();
</script>

<template>
  <BaseBlock
    :class="[
      ' transition-colors hover:border-skin-text',
      { '!border-skin-link': selected }
    ]"
  >
    <div class="relative inset-y-0 flex items-center">
      <div class="w-full pr-[44px]">
        <h3 class="truncate" v-text="title" />
        <span class="text-skin-text line-clamp-2" v-text="description" />
      </div>
      <i-ho-check v-if="selected" class="absolute right-0 text-md" />
    </div>
  </BaseBlock>
</template>
