<script setup lang="ts">
import { watch, ref, withDefaults } from 'vue';

interface Props {
  address?: string;
  size?: string;
  imgsrc?: string;
  space?: Record<string, any>;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: '22',
  loading: false
});

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
  <div class="flex">
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
      <transition name="fade">
        <div
          v-if="loading"
          class="absolute right-0 left-0 top-0 bottom-0 rounded-full opacity-80 bg-skin-border flex items-center justify-center"
        >
          <LoadingSpinner />
        </div>
      </transition>
    </span>
  </div>
</template>
