<script setup lang="ts">
import { computed } from 'vue';
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
    truncate: props.truncate
  })
);
</script>

<template>
  <span v-html="textWithLinks" />
</template>
