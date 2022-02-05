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
  <PluginPOAPCustomBlock
    v-if="space.plugins?.poap"
    :space="space"
    :proposal="proposal"
    :results="results"
    :loaded="loadedResults"
    :votes="votes"
    :strategies="strategies"
  />
</template>
