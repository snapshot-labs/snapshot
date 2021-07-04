<template>
  <span v-html="textWithLinks" />
</template>

<script>
import { computed } from 'vue';
import Autolinker from 'autolinker';

export default {
  props: {
    text: String,
    truncate: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const textWithLinks = computed(() =>
      Autolinker.link(props.text, {
        truncate: props.truncate
      })
    );

    return { textWithLinks };
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
