<script setup lang="ts">
import { watch, ref, withDefaults } from 'vue';

interface Props {
  address?: string;
  size?: string;
  imgsrc?: string;
  space?: Record<string, any>;
  previewFile?: File | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  size: '22'
});

const imgUrl = ref<string>('');
const showImg = ref(false);
const avatarImage = ref<HTMLImageElement | null>(null);

function loadImage() {
  imgUrl.value = '';
  if (props.imgsrc) {
    const img = new Image();
    img.src = props.imgsrc as string;
    img.onload = () => {
      imgUrl.value = img.src;
      showImg.value = true;
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

watch(
  () => props.previewFile,
  () => {
    // Preview can be used to show a local image instantly (f.e after uploading an image)
    if (avatarImage.value && props.previewFile) {
      avatarImage.value.src = URL.createObjectURL(props.previewFile);
      return;
    }
    // This removes the preview image if it's a blob and the previewFile is blank
    if (avatarImage.value?.src.startsWith('blob') && !props.previewFile) {
      return (avatarImage.value.src = '');
    }
  },
  { immediate: true }
);
</script>

<template>
  <span class="flex shrink-0 items-center justify-center">
    <img
      ref="avatarImage"
      :src="
        imgUrl ||
        `https://stamp.fyi/avatar/eth:${address}?s=${parseInt(size) * 2}`
      "
      class="rounded-full object-cover"
      :class="'bg-[color:var(--border-color)]'"
      :style="{
        width: `${parseInt(size)}px`,
        height: `${parseInt(size)}px`,
        minWidth: `${parseInt(size)}px`
      }"
      :alt="space?.name"
    />
  </span>
</template>
