<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  address: String,
  size: String,
  imgsrc: String,
  space: Object
});

const error = ref(false);
const loadedImg = ref(null);

onMounted(() => {
  const img = new Image();
  img.src = props.imgsrc;
  img.onload = () => {
    loadedImg.value = img.src;
  };
  img.onerror = () => {
    error.value = true;
  };
});
</script>

<template>
  <span class="flex shrink-0 items-center justify-center">
    <img
      v-if="loadedImg && !error"
      :src="loadedImg"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`
      }"
      :class="[
        space?.skin ? `${space?.skin} bg-[color:var(--bg-color)]` : 'bg-white'
      ]"
      :alt="space?.name"
      class="rounded-full"
    />
    <UiBlockie
      v-else-if="!!address"
      :seed="address"
      class="rounded-full"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`
      }"
      :alt="space?.name"
    />
  </span>
</template>
