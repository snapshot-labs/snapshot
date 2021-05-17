<template>
  <span v-html="textWithLinks" />
</template>

<script>
import Autolinker from 'autolinker';

export default {
  props: {
    text: String,
    truncate: {
      type: Number,
      default: 0
    }
  },
  computed: {
    textWithLinks() {
      return Autolinker.link(this.text, {
        truncate: this.truncate
      });
    }
  }
};
</script>

<style lang="scss">
@import '../../vars';

.markdown-body {
  h1,
  h2 {
    font-size: $h2-size;
    border-bottom: 0;
  }

  img {
    border-radius: 8px;
  }
}
</style>
