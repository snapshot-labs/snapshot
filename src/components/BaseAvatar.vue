<script setup lang="ts">
interface Props {
  src: string;
  size?: string;
  previewFile?: File | undefined;
  square?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '22',
  previewFile: undefined
});

const avatarImage = ref<HTMLImageElement | null>(null);

const radius = computed(() =>
  props.square
    ? Number(props.size) < 60
      ? 'rounded-[6px]'
      : 'rounded-[10px]'
    : 'rounded-full'
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
  <div>
    <!-- Show local review image if previewFile is defined -->
    <img
      v-show="previewFile"
      ref="avatarImage"
      class="bg-skin-border object-cover"
      :class="radius"
      :style="{
        width: `${Number(size)}px`,
        height: `${Number(size)}px`,
        minWidth: `${Number(size)}px`
      }"
      alt="avatar"
    />
    <!-- else show image from ipfs or stamp -->
    <img
      v-show="!previewFile && src"
      :src="src"
      class="bg-skin-border object-cover"
      :class="radius"
      :style="{
        width: `${Number(size)}px`,
        height: `${Number(size)}px`,
        minWidth: `${Number(size)}px`
      }"
      alt="avatar"
    />
    <div
      v-if="!src && !previewFile"
      class="bg-skin-border"
      :class="radius"
      :style="{
        width: `${Number(size)}px`,
        height: `${Number(size)}px`,
        minWidth: `${Number(size)}px`
      }"
    />
  </div>
</template>
