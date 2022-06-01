<script setup lang="ts">
import { watch, ref, withDefaults } from 'vue';

interface Props {
  size?: string;
  src?: string;
  previewFile?: File | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  size: '22'
});

const avatarImage = ref<HTMLImageElement | null>(null);

watch(
  () => props.previewFile,
  () => {
    // Preview can be used to show a local image instantly (f.e after uploading an image)
    if (avatarImage.value && props.previewFile) {
      return (avatarImage.value.src = URL.createObjectURL(props.previewFile));
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
    <!-- Show local review image if previewFile is defined -->
    <img
      v-show="previewFile"
      ref="avatarImage"
      class="rounded-full object-cover"
      :class="'bg-[color:var(--border-color)]'"
      :style="{
        width: `${Number(size)}px`,
        height: `${Number(size)}px`,
        minWidth: `${Number(size)}px`
      }"
      alt="avatar"
    />
    <!-- else show image from ipfs or stamp -->
    <img
      v-show="!previewFile"
      :src="src"
      class="rounded-full object-cover"
      :class="'bg-[color:var(--border-color)]'"
      :style="{
        width: `${Number(size)}px`,
        height: `${Number(size)}px`,
        minWidth: `${Number(size)}px`
      }"
      alt="avatar"
    />
  </span>
</template>
