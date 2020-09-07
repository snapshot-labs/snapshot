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
      :onerror="onError()"
    />
    <span v-if="showSymbol || loadError">{{ symbol }}</span>
  </span>
</template>

<script>
export default {
  props: ['space', 'symbol', 'size', 'showSymbol'],
  data: () => ({
    loadError: false
  }),
  methods: {
    onError: function() {
      this.$data.loadError = true;
    }
  },
  computed: {
    symbolUrl() {
      return this.symbol
        ? `https://raw.githubusercontent.com/balancer-labs/snapshot/develop/spaces/${this.space}/symbols/${this.symbol}.png`
        : `https://raw.githubusercontent.com/balancer-labs/snapshot/develop/spaces/${this.space}/logo.png`;
    }
  }
};
</script>
