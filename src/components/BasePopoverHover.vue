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
const timerOpen = ref<any>(null);
const timerClose = ref<any>(null);

const open = () => {
  if (timerClose.value !== null) {
    clearTimeout(timerClose.value);
    timerClose.value = null;
  }
  timerOpen.value = setTimeout(() => {
    show.value = true;
  }, 200);
};

const delayClose = () => {
  if (timerOpen.value !== null) {
    clearTimeout(timerOpen.value);
    timerOpen.value = null;
  }
  timerClose.value = setTimeout(() => {
    show.value = false;
  }, 150);
};
</script>

<template>
  <Popover>
    <Float
      enter="transition ease-out duration-100"
      enter-from="transform opacity-0 scale-95"
      enter-to="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leave-from="transform opacity-100 scale-100"
      leave-to="transform opacity-0 scale-95"
      :show="show"
      :placement="placement"
      :offset="10"
      :shift="16"
      :flip="16"
      :z-index="50"
      portal
    >
      <PopoverButton
        class="outline-none"
        @mouseenter="open"
        @mouseleave="delayClose"
      >
        <slot name="button" />
      </PopoverButton>

      <PopoverPanel
        class="w-screen outline-none sm:max-w-sm"
        static
        @mouseenter="open"
        @mouseleave="delayClose"
      >
        <div
          class="overflow-hidden rounded-2xl border bg-skin-header-bg shadow-lg"
        >
          <div
            class="no-scrollbar max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <slot name="content" />
          </div>
        </div>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
