<script setup>
const props = defineProps({
  proposal: Object,
  space: Object,
  loadedResults: Object
});
console.log('props.proposal', props.proposal);
</script>

<template>
  <PluginCommentBoxCustomBlock
    :proposalId="proposal.id"
    :proposal="proposal"
    :space="space"
  />
</template>
