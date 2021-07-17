<script setup>
import { onMounted, ref, watch, defineProps } from 'vue';
import { createPopper } from '@popperjs/core';
import { useDebounce } from '@/composables/useDebounce';
import { useDetectInput } from '@/composables/useDetectInput';
import { useMediaQuery } from '@/composables/useMediaQuery';

const props = defineProps({
  options: Object
});

const open = ref(false);
const popHovered = ref(false);

const itemref = ref(null);
const contentref = ref(null);

const { isTouchScreen } = useDetectInput();
const { isXLargeScreen } = useMediaQuery();

const debounce = useDebounce();

function popClose() {
  if (!popHovered.value) open.value = false;
}

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

watch(open, () => {
  if (!isXLargeScreen.value) popperInstance.setOptions({ placement: 'bottom' });
  else popperInstance.setOptions({ placement: 'bottom-start' });
});
</script>

<template>
  <div
    ref="itemref"
    @mouseenter="isTouchScreen() ? null : debounce(() => (open = true), 800)"
    @mouseleave="debounce(() => popClose(), 300)"
  >
    <slot name="item" />
  </div>
  <div
    ref="contentref"
    v-show="open"
    @mouseenter="popHovered = true"
    @mouseleave="(popHovered = false), debounce(() => (open = false), 300)"
    class="custom-content"
  >
    <slot name="content" />
  </div>
</template>

<style scoped lang="scss">
.custom-content {
  z-index: 50;
  min-width: 300px;
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 0 20px -6px var(--border-color);
}
</style>
