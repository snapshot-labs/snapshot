<script setup>
import { ref } from 'vue';

defineProps({
  address: String,
  size: String,
  imgsrc: String,
  space: Object
});

const error = ref(false);
</script>

<template>
  <span class="flex shrink-0 items-center justify-center">
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
