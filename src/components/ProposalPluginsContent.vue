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
    <PluginCommentBoxCustomBlock
      v-if="space.plugins?.commentBox"
      :proposalId="id"
      :proposal="proposal"
      :space="space"
    />
  </div>
</template>
