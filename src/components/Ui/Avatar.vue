<script setup>
import { ref } from 'vue';

defineProps({
  address: String,
  size: String,
  imgsrc: String,
  seed: [Number, String],
  space: Object
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
      :class="[
        space?.skin ? `${space?.skin} bg-[color:var(--bg-color)]` : 'bg-white'
      ]"
      class="rounded-full inline-block !align-middle leading-none"
    />
    <jazzicon
      v-else
      :seed="parseInt(seed)"
      :address="address"
      :diameter="parseInt(size) - 2 || 22"
      class="inline-block !align-middle"
      style="line-height: 0"
    />
  </span>
</template>
