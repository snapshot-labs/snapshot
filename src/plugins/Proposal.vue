<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents, setTemplateName } = usePlugins();
setTemplateName('Proposal');

addComponents(['safeSnap', 'charts', 'commentBox']);

const props = defineProps({
  proposal: Object,
  space: Object,
  votes: Object,
  loadedResults: Object
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
