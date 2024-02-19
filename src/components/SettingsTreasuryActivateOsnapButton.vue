<script setup lang="ts">
defineProps<{
  isOsnapEnabled: boolean;
}>();
</script>

<template>
  <button
    v-if="isOsnapEnabled"
    class="flex items-center gap-2 rounded-full px-3 py-2 bg-skin-primary text-skin-bg"
  >
    <span class="block h-[6px] w-[6px] rounded-full bg-green" />oSnap activated
  </button>
  <button
    v-else
    class="bg-skin-link text-skin-bg flex items-center gap-2 rounded-full px-3 py-2"
  >
    <span class="block h-[6px] w-[6px] rounded-full bg-skin-bg opacity-30" />
    Activate oSnap
  </button>
</template>
