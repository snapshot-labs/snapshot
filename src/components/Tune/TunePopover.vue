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
    <Float
      enter="transition ease-out duration-100"
      enter-from="transform opacity-0 scale-95"
      enter-to="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leave-from="transform opacity-100 scale-100"
      leave-to="transform opacity-0 scale-95"
      :placement="placement"
      :offset="4"
      :shift="16"
      :flip="16"
      :z-index="50"
      portal
    >
      <PopoverButton class="outline-none">
        <slot v-if="$slots.button" name="button" />
        <TuneButton v-else class="flex items-center gap-1">
          <span>{{ label }}</span>
          <i-ho-chevron-down
            class="text-sm text-skin-link"
            aria-hidden="true"
          />
        </TuneButton>
      </PopoverButton>

      <PopoverPanel
        v-slot="{ close }"
        class="w-screen max-w-xs outline-none sm:max-w-sm"
      >
        <div class="tune-popover overflow-hidden">
          <div
            class="no-scrollbar max-h-[85vh] overflow-y-auto overscroll-contain"
          >
            <slot name="content" :close="close" />
          </div>
        </div>
      </PopoverPanel>
    </Float>
  </Popover>
</template>
