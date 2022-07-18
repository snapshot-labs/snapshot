<script setup>
import ProjectGalaxyCustomBlock from './components/CustomBlock.vue';

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
  <ProjectGalaxyCustomBlock
    v-if="space.plugins?.projectGalaxy"
    :space="space"
    :proposal="proposal"
    :results="results"
    :loaded="loadedResults"
    :votes="votes"
    :strategies="strategies"
  />
</template>
