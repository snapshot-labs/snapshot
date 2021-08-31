<script setup>
import { ref } from 'vue';
import VueBlockie from 'vue-blockies';

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
    <VueBlockie
      v-else
      :seed="address"
      :scale="4"
      :size="(parseInt(size) - 2 || 22) / 4"
      class="circle v-align-middle line-height-0"
    />
  </span>
</template>
