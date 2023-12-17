<script setup lang="ts">
import { DialogDescription } from '@headlessui/vue';
</script>

<template>
  <DialogDescription as="p" class="tune-modal-description">
    <slot />
  </DialogDescription>
</template>
