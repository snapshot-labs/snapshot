<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePointer, debouncedWatch } from '@vueuse/core';
import { Placement } from '@popperjs/core';

defineProps<{
  options: { placement: Placement; offset: number[] };
}>();

const open = ref(false);
const contentHovered = ref(false);
const itemHovered = ref(false);
const hovered = computed(() => contentHovered.value || itemHovered.value);

const { pointerType } = usePointer();

debouncedWatch(
  hovered,
  () => {
    open.value = hovered.value && pointerType.value === 'mouse';
  },
  { debounce: 500 }
);
</script>

<template>
  <BasePopover :options="options" :open="open">
    <template #item>
      <div @mouseenter="itemHovered = true" @mouseleave="itemHovered = false">
        <slot name="item" />
      </div>
    </template>
    <template #content>
      <div
        @mouseenter="contentHovered = true"
        @mouseleave="contentHovered = false"
      >
        <slot name="content" />
      </div>
    </template>
  </BasePopover>
</template>
