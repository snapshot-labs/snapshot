<script setup>
import HalCustomBlock from './components/CustomBlock.vue';

defineProps({
  space: Object
});
</script>

<template>
  <HalCustomBlock v-if="space.plugins.hal" :space="space" />
</template>
