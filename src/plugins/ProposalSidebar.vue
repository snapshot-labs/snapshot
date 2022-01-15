<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents, setTemplateName } = usePlugins();
setTemplateName('ProposalSidebar');

addComponents(['chainlink', 'hal', 'poap', 'quorum', 'aragon']);

const props = defineProps({
  id: String,
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
