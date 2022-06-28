<script setup>
import QuorumCustomBlock from './components/CustomBlock.vue';

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
  <QuorumCustomBlock
    v-if="space.plugins.quorum && !space.voting?.quorum"
    :loaded="loadedResults"
    :space="space"
    :proposal="proposal"
    :results="results"
    :strategies="strategies"
  />
</template>
