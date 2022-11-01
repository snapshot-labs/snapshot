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
      'cursor-pointer transition-colors hover:border-skin-text',
      { '!border-skin-link': selected }
    ]"
  >
    <div class="relative inset-y-0 flex items-center">
      <div :class="['w-full', { 'pr-[44px]': selected }]">
        <h3 :class="['truncate', { 'mt-0': description }]" v-text="title" />
        <span class="text-skin-text" v-text="description" />
      </div>
      <i-ho-check v-if="selected" class="absolute right-0 text-md" />
    </div>
  </BaseBlock>
</template>
