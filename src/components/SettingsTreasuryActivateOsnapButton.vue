<script setup lang="ts">
defineProps<{
  isOsnapEnabled: boolean;
}>();
</script>

<template>
  <button
    v-if="isOsnapEnabled"
    class="flex items-center gap-2 rounded-full bg-[hsla(122,100%,45%,0.13)] px-3 py-2 text-[hsl(122,100%,21%)]"
  >
    <span
      class="block h-[6px] w-[6px] rounded-full bg-[hsl(122,100%,45%)]"
    ></span
    >oSnap activated
  </button>
  <button
    v-else
    class="flex items-center gap-2 rounded-full bg-black px-3 py-2 text-white"
  >
    <span class="block h-[6px] w-[6px] rounded-full bg-white/30"></span>
    Activate oSnap
  </button>
</template>
