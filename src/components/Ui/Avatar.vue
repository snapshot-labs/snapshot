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
      :class="[space?.skin ? 'background-avatar' : 'bg-white']"
      class="rounded-full inline-block leading-none align-middle"
    />
    <jazzicon
      v-else
      :seed="parseInt(seed)"
      :address="address"
      :diameter="parseInt(size) - 2 || 22"
      class="inline-block align-middle leading-none"
    />
  </span>
</template>

<style scoped>
.background-avatar {
  background-color: var(--bg-color);
}
</style>
