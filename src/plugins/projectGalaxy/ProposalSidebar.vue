<script setup>
import ProjectGalaxyCustomBlock from './components/CustomBlock.vue';

defineProps({
  space: Object,
  proposal: Object,
  results: Object,
  loadedResults: Boolean,
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
    :strategies="strategies"
  />
</template>
