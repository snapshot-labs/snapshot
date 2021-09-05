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
  <div class="markdown-body break-words" v-html="markdown" />
</template>

<style lang="scss">
.markdown-body {
  h1,
  h2 {
    font-size: 30px;
    border-bottom: 1px solid #eaecef;
    margin: 24px 0 16px;
    padding-bottom: 7px;
  }

  h3 {
    margin: 24px 0 16px;
    font-size: 25px;
  }

  h4 {
    margin: 24px 0 16px;
    font-size: 20px;
  }

  img {
    border-radius: 8px;
  }

  p {
    line-height: 28px;
    font-size: 22px;
  }

  ul {
    padding-left: 40px;
    list-style-type: disc;
    font-size: 20px;
    line-height: 28px;
  }

  ol {
    padding-left: 40px;
    list-style-type: decimal;
    font-size: 20px;
    line-height: 28px;
  }

  li {
    margin-top: 6px;
  }

  code {
    font-size: 17px;
  }

  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 4px;
    word-wrap: normal;
    font-size: 17px !important;
  }

  p,
  blockquote,
  ul,
  ol,
  dl,
  table,
  pre,
  details {
    margin-top: 0;
    margin-bottom: 16px;
  }

  blockquote {
    margin-bottom: 16px;
    padding: 0 20px;
    color: var(--text-color);
    border-left-color: var(--text-color);
    border-left: 5px solid #dfe2e5;
  }
}
</style>
