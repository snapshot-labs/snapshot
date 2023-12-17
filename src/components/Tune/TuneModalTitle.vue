<script setup lang="ts">
import { DialogTitle } from '@headlessui/vue';
</script>

<template>
  <DialogTitle as="h3" class="tune-modal-title">
    <slot />
  </DialogTitle>
</template>
