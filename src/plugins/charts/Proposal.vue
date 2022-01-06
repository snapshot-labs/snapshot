<script setup>
defineProps({
  proposal: Object,
  space: Object,
  votes: Object,
  loadedResults: Object
});
</script>

<template>
  <PluginChartsCustomBlock
    v-if="loadedResults && space.plugins.charts"
    :space="space"
    :proposal="proposal"
    :votes="votes"
  />
</template>