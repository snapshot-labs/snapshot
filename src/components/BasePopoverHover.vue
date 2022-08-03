<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { usePointer, debouncedWatch } from '@vueuse/core';
import { createPopper, Placement } from '@popperjs/core';

const props = defineProps<{
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

const itemref = ref<HTMLElement | null>(null);
const contentref = ref(null);

let popperInstance;

onMounted(() => {
  if (!itemref.value || !contentref.value) return;
  popperInstance = createPopper(itemref.value, contentref.value, {
    placement: props.options.placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: props.options.offset
        }
      }
    ]
  });
});

watch(open, () => {
  popperInstance.setOptions({ placement: props.options.placement });
});
</script>

<template>
  <div ref="itemref" class="h-full">
    <div @mouseenter="itemHovered = true" @mouseleave="itemHovered = false">
      <slot name="item" />
    </div>
  </div>
  <div v-show="open" ref="contentref" class="z-50" @click.prevent.self>
    <div
      @mouseenter="contentHovered = true"
      @mouseleave="contentHovered = false"
    >
      <slot name="content" />
    </div>
  </div>
</template>
