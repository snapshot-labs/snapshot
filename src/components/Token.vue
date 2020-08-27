<template>
  <img
    :src="
      `https://raw.githubusercontent.com/balancer-labs/snapshot/develop/src/assets/${namespace}.png`
    "
    class="d-inline-block bg-gray-9 v-align-middle line-height-0 circle border"
    :style="{
      width: `${size || 22}px`,
      height: `${size || 22}px`
    }"
  />
</template>

<script>
export default {
  props: ['namespace', 'size']
};
</script>
