<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';

defineProps<{
  label?: string;
}>();
</script>

<template>
  <Popover class="relative">
    <PopoverButton>
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
      <PopoverPanel class="absolute right-0 z-20 mt-2 w-screen max-w-sm">
        <div class="overflow-hidden rounded-2xl bg-skin-header-bg shadow-lg">
          <slot name="content" />
        </div>
      </PopoverPanel>
    </Transition>
  </Popover>
</template>
