<script setup lang="ts">
withDefaults(
  defineProps<{
    address: string;
    size?: string;
  }>(),
  {
    size: '22'
  }
);
</script>

<template>
  <img
    :src="`https://cdn.stamp.fyi/token/eth:${address}?s=100`"
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
      ).src = `https://cdn.stamp.fyi/token/eth:${address}?s=100`
    "
  />
</template>
