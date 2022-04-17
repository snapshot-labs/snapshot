<script setup lang="ts">
import { watch, ref, withDefaults } from 'vue';

interface Props {
  address?: string;
  size?: string;
  imgsrc?: string;
  space?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  size: '22'
});

const imgUrl = ref<string>('');
const showImg = ref(false);
const loadingImg = ref(false);

function loadImage() {
  if (props.imgsrc) {
    const img = new Image();
    img.src = props.imgsrc as string;
    loadingImg.value = true;
    img.onload = () => {
      imgUrl.value = img.src;
      showImg.value = true;
      loadingImg.value = false;
    };
  }
}

watch(
  () => props.imgsrc,
  () => {
    loadImage();
  },
  { immediate: true }
);
</script>

<template>
  <span class="flex shrink-0 items-center justify-center relative">
    <img
      :src="
        imgUrl ||
        `https://stamp.fyi/avatar/eth:${address}?s=${parseInt(size) * 2}`
      "
      class="rounded-full"
      :class="'bg-[color:var(--border-color)]'"
      :style="{
        width: `${parseInt(size)}px`,
        height: `${parseInt(size)}px`,
        minWidth: `${parseInt(size)}px`
      }"
      :alt="space?.name"
    />
    <slot name="overlay" :loadingImg="loadingImg" />
  </span>
</template>
