<template>
  <div class="markdown-body break-word" v-html="markdown" />
</template>
<script lang="ts">
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import sanitizeHtml from 'sanitize-html';

const sanitizerOptions = {
  allowedTags: [
    'a',
    'abbr',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    // images disabled until they can be safely proxied or filtered to load only from ipfs
    // 'img',
    'li',
    'nl',
    'ol',
    'p',
    'pre',
    'strike',
    'strong',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'ul'
  ],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: function(tagName, attribs) {
      // open external links in new window/tab
      const isAnchor = (attribs.href || '')[0] === '#';
      if (!isAnchor) {
        attribs.target = '_blank';
        attribs.rel = 'noopener';
      }
      return { tagName, attribs };
    }
  }
};

const remarkable = new Remarkable({
  html: false,
  breaks: true,
  typographer: false
}).use(linkify);

export default {
  props: ['body'],
  computed: {
    markdown(this: any) {
      const unsafeHtml = remarkable.render(this.body);
      return sanitizeHtml(unsafeHtml, sanitizerOptions);
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
