<template>
  <div
    ref="itemref"
    @mouseenter="debounce(() => (open = true), openDelay)"
    @mouseleave="debounce(() => popClose(), closeDelay)"
  >
    <slot name="item" />
  </div>
  <div
    ref="contentref"
    v-show="open"
    @mouseenter="debounce(() => (popHovered = true), openDelay)"
    @mouseleave="
      (popHovered = false), debounce(() => (open = false), closeDelay)
    "
    class="custom-content width-full width-sm-auto"
  >
    <slot name="content" />
  </div>
</template>

<script>
import { onMounted, ref, watch, computed } from 'vue';
import { createPopper } from '@popperjs/core';
import { useDebounce } from '@/composables/useDebounce';

export default {
  props: {
    options: Object
  },
  setup(props) {
    const open = ref(false);
    const popHovered = ref(false);

    const itemref = ref(null);
    const contentref = ref(null);

    const openDelay = computed(() =>
      window.matchMedia('(max-width: 850px)').matches ? 150 : 800
    );

    const closeDelay = computed(() =>
      window.matchMedia('(max-width: 850px)').matches ? 50 : 300
    );

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

    watch(open, v => {
      if (window.matchMedia('(min-width: 1150px)').matches)
        popperInstance.setOptions({ placement: 'bottom' });
      else popperInstance.setOptions({ placement: 'bottom-start' });
    });

    return {
      open,
      popClose,
      popHovered,
      itemref,
      contentref,
      debounce: useDebounce(),
      openDelay,
      closeDelay
    };
  }
};
</script>

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
