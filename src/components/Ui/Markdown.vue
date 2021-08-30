<script setup>
import { computed } from 'vue';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
// import sanitizeHtml from 'sanitize-html';

const props = defineProps({ body: String });

const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false
}).use(linkify);

const markdown = computed(() => {
  let body = props.body;
  body = remarkable.render(body);
  // body = sanitizeHtml(body);
  return body;
});
</script>

<template>
  <div class="markdown-body break-word" v-html="markdown" />
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
