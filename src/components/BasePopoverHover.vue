<script setup lang="ts">
import { ref } from 'vue';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { Float } from '@headlessui-float/vue';
import type { Placement } from '@floating-ui/dom';

withDefaults(
  defineProps<{
    placement?: Placement;
  }>(),
  {
    placement: 'bottom-end'
  }
);

const show = ref(false);
const timer = ref<any>(null);

const open = () => {
  if (timer.value !== null) {
    clearTimeout(timer.value);
    timer.value = null;
  }
  show.value = true;
};

const delayClose = () => {
  timer.value = setTimeout(() => {
    show.value = false;
  }, 150);
};
</script>

<template>
  <Popover>
    <Float :show="show" :placement="placement" :offset="10" :shift="8">
      <PopoverButton
        class="outline-none"
        @mouseenter="open"
        @mouseleave="delayClose"
      >
        <slot name="button" />
      </PopoverButton>

      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <PopoverPanel
          class="z-20 w-screen outline-none sm:max-w-sm"
          static
          @mouseenter="open"
          @mouseleave="delayClose"
        >
          <div class="overflow-hidden rounded-2xl bg-skin-header-bg shadow-lg">
            <div
              class="no-scrollbar max-h-[85vh] overflow-y-auto overscroll-contain"
            >
              <slot name="content" />
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Float>
  </Popover>
</template>
