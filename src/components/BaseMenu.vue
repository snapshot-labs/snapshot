<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';

type Item = {
  text: string;
  action: string;
  extras?: any;
};

defineProps<{
  items: Item[];
  label?: string;
}>();

const emit = defineEmits(['select']);
</script>

<template>
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton>
        <span v-if="$slots.button">
          <slot name="button" />
        </span>
        <BaseButton v-else>
          {{ label }}
          <i-ho-chevron-down class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </BaseButton>
      </MenuButton>
    </div>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems
        class="absolute right-0 mt-2 origin-top-right overflow-hidden rounded-2xl bg-skin-header-bg shadow-lg"
      >
        <MenuItem v-for="item in items" :key="item.text" v-slot="{ active }">
          <div
            :class="[
              active
                ? 'bg-skin-border text-skin-link'
                : 'bg-skin-header-bg text-skin-text',
              'cursor-pointer whitespace-nowrap px-3 py-2'
            ]"
            @click="emit('select', item.action)"
          >
            <slot :key="item" name="item" :item="item">
              {{ item.text }}
            </slot>
          </div>
        </MenuItem>
      </MenuItems>
    </Transition>
  </Menu>
</template>
