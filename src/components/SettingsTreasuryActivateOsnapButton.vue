<script setup lang="ts">
defineProps<{
  isOsnapEnabled: boolean;
}>();
</script>

<template>
  <button v-if="isOsnapEnabled" class="text-[hsl(122,100%,21%)] bg-[hsla(122,100%,45%,0.13)] rounded-full px-3 py-2 flex items-center gap-2"><span class="block w-[6px] h-[6px] bg-[hsl(122,100%,45%)] rounded-full"></span>oSnap activated</button>
  <button v-else class="text-white bg-black rounded-full px-3 py-2 flex items-center gap-2"><span class="block w-[6px] h-[6px] bg-white/30 rounded-full"></span> Activate oSnap</button>
</template>