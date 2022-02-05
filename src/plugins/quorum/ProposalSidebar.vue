<script setup>
defineProps({
  space: Object,
  proposal: Object,
  results: Object,
  loadedResults: Boolean,
  votes: Object,
  strategies: Object
});
</script>

<template>
  <PluginQuorumCustomBlock
    :loaded="loadedResults"
    v-if="space.plugins.quorum && !space.voting?.quorum"
    :space="space"
    :proposal="proposal"
    :results="results"
    :strategies="strategies"
  />
</template>
