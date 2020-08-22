<template>
  <div class="markdown-body break-word" v-html="markdown" />
</template>
<script>
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
// import sanitizeHtml from 'sanitize-html';

const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false
}).use(linkify);

export default {
  props: ['body'],
  computed: {
    markdown() {
      let body = this.body;
      body = remarkable.render(body);
      // body = sanitizeHtml(body);
      return body;
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
