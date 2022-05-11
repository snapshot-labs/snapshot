<script setup lang="ts">
import { watch, ref, withDefaults, computed } from 'vue';
import { useProfiles } from '@/composables/useProfiles';

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

const { profilesCreated } = useProfiles();

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

const timestamp = computed(() => {
  if (!props?.address || !profilesCreated.value?.[props.address]) return '';
  return `&ts=${profilesCreated.value[props.address]}`;
});

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
        width: `${parseInt(size)}px`,
        height: `${parseInt(size)}px`,
        minWidth: `${parseInt(size)}px`
      }"
      :alt="space?.name"
    />
    <!-- else show image from ipfs or stamp -->
    <img
      v-show="!previewFile"
      :src="
        imgUrl ||
        `https://stamp.fyi/avatar/eth:${address}?s=${
          parseInt(size) * 2
        }${timestamp}`
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
