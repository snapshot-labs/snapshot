<template>
  <span class="d-inline-block v-align-middle line-height-0">
    <UiAvatar :imgsrc="url" :address="spaceAddress" :size="size" />
  </span>
</template>

<script>
import { formatBytes32String } from '@ethersproject/strings';

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
      const url = this.space.avatar
        ? this.space.avatar
        : `https://raw.githubusercontent.com/snapshot-labs/snapshot-spaces/master/spaces/${this.spaceId}/${file}.png`;
      return `https://worker.snapshot.org/mirror?img=${encodeURIComponent(
        url
      )}`;
    },
    spaceAddress() {
      if (this.spaceId) return formatBytes32String(this.spaceId.slice(0, 24));
      return '';
    },
    spaceId() {
      return this.space.id ?? this.space.key;
    }
  }
};
</script>
