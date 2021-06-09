<template>
  <div
    ref="popref"
    @mouseenter="debounce(() => (open = true))"
    @mouseleave="debounce(() => popClose())"
  >
    <slot name="item" />
  </div>
  <div
    ref="contentref"
    v-show="open"
    @mouseenter="debounce(() => (popHovered = true))"
    @mouseleave="(popHovered = false), debounce(() => (open = false))"
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
  setup() {
    const open = ref(false);
    const popHovered = ref(false);

    const popref = ref(null);
    const contentref = ref(null);

    function popClose() {
      if (!popHovered.value) open.value = false;
    }

    let popperInstance;

    onMounted(() => {
      popperInstance = createPopper(popref.value, contentref.value, {
        placement: 'bottom',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 12]
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
      popref,
      contentref,
      debounce: useDebounce()
    };
  }
};
</script>

<style scoped lang="scss">
.custom-content {
  width: 350px;
  background-color: var(--header-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 0 20px -6px var(--border-color);
}
</style>
