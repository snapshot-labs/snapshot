<script setup>
import ProgressCustomBlock from './components/CustomBlock.vue';

defineProps({
  space: Object,
  proposal: Object,
  results: Object,
  loadedResults: Boolean,
  strategies: Object
});
</script>

<template>
  <ProgressCustomBlock
    :loaded="loadedResults"
    :space="space"
    :proposal="proposal"
    :results="results"
    :strategies="strategies"
  />
</template>
