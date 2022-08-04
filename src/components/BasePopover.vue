<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { Float } from '@headlessui-float/vue';
import type { Placement } from '@floating-ui/dom';

withDefaults(
  defineProps<{
    label?: string;
    placement?: Placement;
  }>(),
  {
    label: '',
    placement: 'bottom-end'
  }
);
</script>

<template>
  <Popover>
    <Float :placement="placement" :offset="10" :shift="8">
      <PopoverButton class="outline-none">
        <slot v-if="$slots.button" name="button" />
        <div v-else>
          <span>{{ label }}</span>
          <i-ho-chevron-down class="ml-2 h-5 w-5" aria-hidden="true" />
        </div>
      </PopoverButton>

      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <PopoverPanel class="z-20 w-screen max-w-xs outline-none sm:max-w-sm">
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
