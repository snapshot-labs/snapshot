<script setup>
defineProps({
  id: String,
  space: Object,
  proposal: Object,
  votes: Object,
  loadedResults: Boolean
});
</script>

<template>
  <div>
    <PluginChartsCustomBlock
      v-if="loadedResults && space.plugins?.charts"
      :space="space"
      :proposal="proposal"
      :votes="votes"
    />
    <PluginCommentBoxCustomBlock
      v-if="space.plugins?.commentBox"
      :proposalId="id"
      :proposal="proposal"
      :space="space"
    />
  </div>
</template>
