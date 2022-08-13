<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string;
    address?: string;
    size?: string;
  }>(),
  {
    size: '22',
    address: '0x3901D0fDe232aF1427216b79f5243f8A022d28cf'
  }
);
</script>

<template>
  <img
    :src="src"
    class="rounded-full bg-skin-border object-cover"
    :style="{
      width: `${Number(size)}px`,
      height: `${Number(size)}px`,
      minWidth: `${Number(size)}px`
    }"
    alt="Token logo"
    @error="
      (
        $event.target as HTMLImageElement
      ).src = `https://cdn.stamp.fyi/avatar/eth:${address}?s=100`
    "
  />
</template>
