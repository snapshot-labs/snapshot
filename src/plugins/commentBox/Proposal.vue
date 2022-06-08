<script setup>
import CommentBoxCustomBlock from './components/CustomBlock.vue';

defineProps({
  proposal: Object,
  space: Object,
  loadedResults: Boolean
});
</script>

<template>
  <CommentBoxCustomBlock
    :proposal-id="proposal.id"
    :proposal="proposal"
    :space="space"
  />
</template>
