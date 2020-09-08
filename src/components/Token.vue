<template>
  <span>
    <img
      v-if="!loadError"
      :src="symbolUrl"
      class="d-inline-block bg-gray-9 v-align-middle line-height-0 circle border"
      :style="{
        width: `${size || 22}px`,
        height: `${size || 22}px`
      }"
    />
    <span v-if="showSymbol || loadError">{{ symbol }}</span>
  </span>
</template>

<script>
export default {
  props: ['space', 'symbol', 'size', 'showSymbol', 'symbolIndex'],
  computed: {
    symbolUrl() {
      const id = this.symbolIndex ? this.symbolIndex : '';
      return `https://raw.githubusercontent.com/balancer-labs/snapshot/develop/spaces/${this.space}/logo${id}.png`;
    }
  }
};
</script>
