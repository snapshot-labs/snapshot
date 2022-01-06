<script setup>
import { computed } from 'vue';
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents } = usePlugins('Proposal');

addComponents(['safeSnap', 'charts', 'commentBox']);

defineProps({
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
