<script setup>
import { ref, defineProps } from 'vue';

defineProps({
  address: String,
  size: String,
  imgsrc: String,
  seed: [Number, String]
});

const error = ref(false);
</script>

<template>
  <span>
    <img
      v-if="imgsrc && !error"
      :src="imgsrc"
      :style="{
        width: `${parseInt(size) || 22}px`,
        height: `${parseInt(size) || 22}px`
      }"
      @error="error = true"
      class="circle border line-height-0 v-align-middle"
    />
    <jazzicon
      v-else
      :seed="parseInt(seed)"
      :address="address"
      :diameter="parseInt(size) - 2 || 22"
      class="d-inline-block v-align-middle line-height-0"
    />
  </span>
</template>
