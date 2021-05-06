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
      :seed="seed"
      :address="address"
      :diameter="parseInt(size) - 2 || 22"
      class="d-inline-block v-align-middle line-height-0"
    />
  </span>
</template>

<script>
export default {
  props: ['address', 'size', 'imgsrc', 'seed'],
  data() {
    return {
      error: false
    };
  }
};
</script>
