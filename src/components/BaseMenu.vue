<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Float } from '@headlessui-float/vue';
import type { Placement } from '@floating-ui/dom';

type Item = {
  text: string;
  action: string;
  extras?: any;
};

withDefaults(
  defineProps<{
    items: Item[];
    selected?: string;
    placement?: Placement;
  }>(),
  {
    selected: '',
    placement: 'bottom-end'
  }
);

const emit = defineEmits(['select']);
</script>

<template>
  <Menu as="div" class="inline-block h-full text-left">
    <Float
      enter="transition ease-out duration-100"
      enter-from="transform opacity-0 scale-95"
      enter-to="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leave-from="transform opacity-100 scale-100"
      leave-to="transform opacity-0 scale-95"
      :placement="placement"
      :offset="8"
      :shift="16"
      :flip="16"
      :z-index="50"
      portal
    >
      <MenuButton class="h-full">
        <slot v-if="$slots.button" name="button" />

        <BaseButton v-else class="flex items-center">
          {{ selected }}
          <i-ho-chevron-down
            class="-mr-1 ml-1 text-xs text-skin-text"
            aria-hidden="true"
          />
        </BaseButton>
      </MenuButton>

      <MenuItems
        class="overflow-hidden rounded-2xl border bg-skin-header-bg shadow-lg outline-none"
      >
        <div class="no-scrollbar max-h-[300px] overflow-auto">
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
        </div>
      </MenuItems>
    </Float>
  </Menu>
</template>
