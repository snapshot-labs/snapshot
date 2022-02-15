<script setup>
import { watch, ref } from 'vue';

const props = defineProps({
  address: String,
  size: String,
  imgsrc: String,
  space: Object
});

const imgUrl = ref(null);
const showImg = ref(false);

watch(
  () => props.imgsrc,
  () => {
    const img = new Image();
    img.onload = () => {
      imgUrl.value = img.src;
      showImg.value = true;
    };
    img.src = props.imgsrc;
  },
  { immediate: true }
);
</script>

<template>
  <span class="flex shrink-0 items-center justify-center">
    <img
      :src="
        imgUrl ||
        `https://stamp.fyi/avatar/eth:${address}?s=${parseInt(size) * 2}`
      "
      class="rounded-full"
      :class="!space && 'bg-[color:var(--border-color)]'"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`
      }"
      :alt="space?.name"
    />
  </span>
</template>
