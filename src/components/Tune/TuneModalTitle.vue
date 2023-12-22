<script setup lang="ts">
import { DialogTitle } from '@headlessui/vue';

withDefaults(
  defineProps<{
    as?: string;
  }>(),
  {
    as: 'h3'
  }
);
</script>

<template>
  <DialogTitle :as="as">
    <slot />
  </DialogTitle>
</template>
