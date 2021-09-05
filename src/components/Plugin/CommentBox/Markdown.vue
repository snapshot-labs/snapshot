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
  <div class="markdown-body markdown-body1 break-word" v-html="markdown" />
</template>

<style lang="scss" >

.markdown-body1 {
  h1,
  h2 {
    font-size: 28px;
    border-bottom: 0;
  }
 a,a:hover {
   text-decoration: underline !important;
}
  img {
    border-radius: 8px;
  }
}
</style>
