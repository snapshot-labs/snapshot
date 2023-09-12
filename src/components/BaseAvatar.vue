<script setup lang="ts">
interface Props {
  src: string;
  size?: string;
  previewFile?: File | undefined;
  roundedSquare?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '22',
  previewFile: undefined,
  roundedSquare: false
});

const avatarImage = ref<HTMLImageElement | null>(null);

const roundedClass = computed(() => {
  if (props.roundedSquare) {
    return Number(props.size) < 40 ? 'rounded' : 'rounded-lg';
  }
  return 'rounded-full';
});

const sizeStyle = computed(() => {
  return {
    width: `${Number(props.size)}px`,
    height: `${Number(props.size)}px`,
    minWidth: `${Number(props.size)}px`
  };
});

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
      class="object-cover"
      :class="roundedClass"
      :style="sizeStyle"
      alt="avatar"
    />
    <!-- else show image from ipfs or stamp -->
    <img
      v-show="!previewFile && src"
      :src="src"
      class="object-cover"
      :class="roundedClass"
      :style="sizeStyle"
      alt="avatar"
    />
    <div v-if="!src && !previewFile" :class="roundedClass" :style="sizeStyle" />
  </div>
</template>
