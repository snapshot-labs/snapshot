<script setup lang="ts">
defineProps<{
  selected?: boolean;
  title: string;
  tag?: string;
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
      <div :class="['w-full text-left', { 'pr-[44px]': selected }]">
        <div class="mb-2 flex items-center gap-2">
          <h3
            :class="['mb-0 truncate', { 'mt-0': description }]"
            v-text="title"
          />
          <BasePill>{{ tag }}</BasePill>
        </div>
        <span class="text-skin-text" v-text="description" />
      </div>
      <i-ho-check v-if="selected" class="absolute right-0 text-md" />
    </div>
  </BaseBlock>
</template>
