<template>
  <img
    :src="url"
    class="d-inline-block bg-gray-9 v-align-middle line-height-0 circle border"
    :style="{
      width: `${size || 22}px`,
      height: `${size || 22}px`
    }"
  />
</template>

<script>
export default {
  props: ['space', 'size', 'symbolIndex'],
  computed: {
    url() {
      const id = this.symbolIndex ? this.symbolIndex : '';
      return `https://raw.githubusercontent.com/balancer-labs/snapshot/develop/spaces/${this.space}/logo${id}.png`;
    }
  }
};
</script>
