<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { createPopper } from '@popperjs/core';
import { usePointer, useMediaQuery, debouncedWatch } from '@vueuse/core';

const props = defineProps({
  options: Object
});

const open = ref(false);
const contentHovered = ref(false);
const itemHovered = ref(false);
const hovered = computed(() => contentHovered.value || itemHovered.value);

const itemref = ref(null);
const contentref = ref(null);

const { pointerType } = usePointer();
const isXLargeScreen = useMediaQuery('(min-width: 1280px)');

let popperInstance;

onMounted(() => {
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

debouncedWatch(
  hovered,
  () => {
    open.value = hovered.value && pointerType.value === 'mouse';
  },
  { debounce: 500 }
);

watch(open, () => {
  if (isXLargeScreen.value) popperInstance.setOptions({ placement: 'bottom' });
  else popperInstance.setOptions({ placement: 'bottom-start' });
});
</script>

<template>
  <div
    ref="itemref"
    @mouseenter="itemHovered = true"
    @mouseleave="itemHovered = false"
  >
    <slot name="item" />
  </div>
  <!-- @click.prevent.self is needed to prevent clicks inside the popover bubbling
   up to the parent -->
  <div
    ref="contentref"
    v-show="open"
    @click.prevent.self
    @mouseenter="contentHovered = true"
    @mouseleave="contentHovered = false"
    class="z-50 min-w-[300px] bg-skin-header-bg border border-skin-border rounded-xl shadow-lg cursor-default"
  >
    <slot name="content" />
  </div>
</template>
