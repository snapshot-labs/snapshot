<script setup>
import { computed } from 'vue';
import blockies from 'ethereum-blockies';

const props = defineProps({
  seed: {
    type: String,
    default: 'randomString'
  },
  /**
   * To manually specify the icon color, default: random
   */
  color: {
    type: String,
    default: '#41B883'
  },
  /**
   * Choose a different background color, default: random
   */
  bgcolor: {
    type: String,
    default: '#35495E'
  },
  /**
   * Width/height of the icon in blocks, default: 8
   */
  size: {
    type: Number,
    default: 8
  },
  /**
   * Width/height of each block in pixels, default: 4
   */
  scale: {
    type: Number,
    default: 4
  },
  /**
   * Each pixel has a 13% chance of being of a third color,
   * default: random. Set to -1 to disable it. These "spots" create structures
   * that look like eyes, mouths and noses.
   */
  spotcolor: {
    type: String,
    default: '#35495E'
  }
});

const blockie = computed(() => {
  const canvas = blockies.create({
    seed: props.seed,
    color: props.color,
    bgcolor: props.bgcolor,
    size: props.size,
    scale: props.scale,
    spotcolor: props.spotcolor
  });
  return canvas.toDataURL();
});
</script>

<template>
  <img :src="blockie" />
</template>
