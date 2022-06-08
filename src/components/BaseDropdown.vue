<script setup lang="ts">
import { ref, onBeforeUnmount, withDefaults } from 'vue';
import { Placement } from '@popperjs/core';

withDefaults(
  defineProps<{
    items:
      | {
          action: string | any;
          text: string;
        }
      | Record<string, any>[];
    placement?: Placement;
  }>(),
  { placement: 'bottom-end' }
);

const emit = defineEmits(['select', 'openChange']);

const open = ref(false);
const dropdownEl = ref<any>(null);

function handleClick(action) {
  emit('select', action);
  open.value = false;
}

function close(e) {
  if (!dropdownEl.value.contains(e.target)) {
    open.value = false;
  }
}

window.addEventListener('click', close);
onBeforeUnmount(() => window.removeEventListener('click', close));
</script>

<template>
  <div ref="dropdownEl" class="h-full">
    <BasePopover :options="{ offset: [0, 12], placement }" :open="open">
      <template #item>
        <div
          @click="open = !open"
          class="inline-flex h-full w-full cursor-pointer items-center"
        >
          <slot name="button" />
        </div>
      </template>

      <template #content>
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            class="z-20 max-w-[320px] overflow-hidden rounded-2xl border border-skin-border bg-skin-header-bg shadow-lg md:max-w-[400px]"
            v-if="open"
          >
            <ul
              class="no-scrollbar max-h-[85vh] overflow-y-auto overscroll-contain"
            >
              <slot name="header" />
              <li
                v-for="item in items"
                :key="item.text"
                @click.stop="handleClick(item.action)"
                :class="{ selected: item.selected }"
                class="group block cursor-pointer select-none list-none whitespace-nowrap px-3 py-2"
              >
                <slot name="item" :item="item" :key="item">
                  {{ item.text }}
                </slot>
              </li>
            </ul>
          </div>
        </Transition>
      </template>
    </BasePopover>
  </div>
</template>

<style scoped>
li.selected,
li:hover {
  @apply bg-skin-border;
}
</style>
