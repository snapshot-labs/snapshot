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
    :proposalId="proposal.id"
    :proposal="proposal"
    :space="space"
  />
</template>
