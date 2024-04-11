<script setup>
import DominoCustomBlock from './components/CustomBlock.vue';

defineProps({
  space: Object
});
</script>

<template>
  <DominoCustomBlock v-if="space.plugins.domino" :space="space" />
</template>
