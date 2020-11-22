<template>
  <span class="d-inline-block v-align-middle line-height-0">
    <img
      v-if="!error"
      :src="url"
      :style="{
        width: `${size || 22}px`,
        height: `${size || 22}px`
      }"
      @error="error = true"
      class="circle border line-height-0"
    />
    <Avatar v-else :address="space" :size="size" />
  </span>
</template>

<script>
export default {
  props: ['space', 'size', 'symbolIndex'],
  data() {
    return {
      error: false
    };
  },
  computed: {
    url() {
      const file = this.symbolIndex
        ? this.symbolIndex === 'space'
          ? 'space'
          : `logo${this.symbolIndex}`
        : 'logo';
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot-spaces/master/spaces/${this.space}/${file}.png`;
    }
  }
};
</script>
