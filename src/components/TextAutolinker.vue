<script setup lang="ts">
import Autolinker from 'autolinker';

interface Props {
  text: string;
  truncate?: number;
}
const props = withDefaults(defineProps<Props>(), {
  truncate: 0
});
const textWithLinks = computed(() =>
  Autolinker.link(props.text, {
    truncate: props.truncate,
    sanitizeHtml: true
  })
);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <span v-html="textWithLinks" />
</template>
