<script setup lang="ts">
import { useBreakpoints } from '@vueuse/core';
import { SNAPSHOT_BREAKPOINTS } from '@/helpers/constants';

const props = withDefaults(
  defineProps<{
    breakPoint?: 'sm' | 'md';
  }>(),
  {
    breakPoint: 'sm'
  }
);

const disabled = useBreakpoints(SNAPSHOT_BREAKPOINTS).greater(props.breakPoint);
</script>

<template>
  <Teleport v-if="!disabled" to="#action-bar">
    <div
      class="fixed bottom-0 z-40 h-[78px] w-full border-t border-skin-border bg-skin-bg sm:w-[calc(100%-60px)]"
    >
      <slot />
    </div>
  </Teleport>

  <slot v-else />
</template>
