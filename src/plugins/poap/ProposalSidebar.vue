<script setup>
import POAPCustomBlock from './components/CustomBlock.vue';

defineProps({
  space: Object,
  proposal: Object,
  results: Object,
  loadedResults: Boolean,
  strategies: Object
});
</script>

<template>
  <POAPCustomBlock
    v-if="space.plugins?.poap"
    :space="space"
    :proposal="proposal"
    :results="results"
    :loaded="loadedResults"
    :strategies="strategies"
  />
</template>
