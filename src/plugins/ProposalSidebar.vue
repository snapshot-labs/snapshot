<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents } = usePlugins('ProposalSidebar');

addComponents(['chainlink', 'hal', 'poap', 'quorum']);

const props = defineProps({
  proposal: Object,
  space: Object,
  results: Object,
  loadedResults: Object,
  votes: Object,
  strategies: Object
});
</script>

<template>
  <component
    v-for="(plugin, key) in space.plugins"
    :key="key"
    :is="components[key]"
    v-bind="props"
  />
</template>
