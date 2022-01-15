<script setup>
defineProps({
  id: String,
  proposal: Object,
  space: Object,
  results: Object,
  loadedResults: Object,
});
</script>

<template>
  <PluginAragonCustomBlock
    :loaded="loadedResults"
    :id="id"
    :space="space"
    :proposal="proposal"
    :results="results"
  />
</template>
