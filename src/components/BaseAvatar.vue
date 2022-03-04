<script setup lang="ts">
import { watch, ref } from 'vue';

const props = defineProps<{
  address?: string;
  size?: string;
  imgsrc?: string;
  space?: Record<string, any>;
}>();

const imgUrl = ref<string>('');
const showImg = ref(false);

watch(
  () => props.imgsrc,
  () => {
    if (props.imgsrc) {
      const img = new Image();
      img.onload = () => {
        imgUrl.value = img.src;
        showImg.value = true;
      };
      img.src = props.imgsrc as string;
    }
  },
  { immediate: true }
);
</script>

<template>
  <span class="flex shrink-0 items-center justify-center">
    <img
      :src="
        imgUrl ||
        `https://stamp.fyi/avatar/eth:${address}?s=${parseInt(size as string) * 2}`
      "
      class="rounded-full"
      :class="!space && 'bg-[color:var(--border-color)]'"
      :style="{
        width: `${parseInt(size as string) || 22}px`,
        height: `${parseInt(size as string) || 22}px`,
        minWidth: `${parseInt(size as string) || 22}px`
      }"
      :alt="space?.name"
    />
  </span>
</template>
