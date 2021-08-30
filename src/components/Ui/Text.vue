<script setup>
import { computed } from 'vue';
import Autolinker from 'autolinker';

const props = defineProps({
  text: String,
  truncate: {
    type: Number,
    default: 0
  }
});

const textWithLinks = computed(() =>
  Autolinker.link(props.text, {
    truncate: props.truncate
  })
);
</script>

<template>
  <span v-html="textWithLinks" />
</template>

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
