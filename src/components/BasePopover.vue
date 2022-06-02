<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { createPopper, Placement } from '@popperjs/core';

const props = defineProps<{
  options: { placement: Placement; offset: number[] };
  open: boolean;
}>();

const itemref = ref<HTMLElement | null>(null);
const contentref = ref(null);

let popperInstance;

onMounted(() => {
  if (!itemref.value || !contentref.value) return;
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

watch(
  () => props.open,
  () => {
    popperInstance.setOptions({ placement: props.options.placement });
  }
);
</script>

<template>
  <div ref="itemref" class="h-full">
    <slot name="item" />
  </div>
  <!-- @click.prevent.self is needed to prevent clicks inside the popover bubbling
   up to the parent -->
  <div ref="contentref" v-show="open" @click.prevent.self class="z-50">
    <slot name="content" />
  </div>
</template>
