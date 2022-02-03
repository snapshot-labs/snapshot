<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  address: String,
  size: String,
  imgsrc: String,
  space: Object
});

const imgUrl = ref(null);
const showImg = ref(false);

onMounted(() => {
  const img = new Image();
  img.onload = () => {
    imgUrl.value = img.src;
    showImg.value = true;
  };
  img.src = props.imgsrc;
});
</script>

<template>
  <span class="flex shrink-0 items-center justify-center">
    <img
      v-if="showImg"
      :src="imgUrl"
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
