<template>
  <div
    ref="itemref"
    @mouseenter="debounce(() => (open = true))"
    @mouseleave="debounce(() => popClose(), 300)"
  >
    <slot name="item" />
  </div>
  <div
    ref="contentref"
    v-show="open"
    @mouseenter="debounce(() => (popHovered = true))"
    @mouseleave="(popHovered = false), debounce(() => (open = false), 300)"
    class="custom-content"
  >
    <slot name="content" />
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
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

    watch(open, value => {
      if (value) popperInstance.update();
    });

    return {
      open,
      popClose,
      popHovered,
      itemref,
      contentref,
      debounce: useDebounce()
    };
  }
};
</script>

<style scoped lang="scss">
.custom-content {
  width: 350px;
  z-index: 50;
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 0 20px -6px var(--border-color);
}
</style>
