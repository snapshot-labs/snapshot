<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents } = usePlugins('Proposal');

addComponents([
  'safeSnap'
]);

const props = defineProps({
  proposal: Object,
  space: Object,
  loadedResults: Object
});
</script>

<template>
  <component v-for="(plugin, key) in proposal.plugins" :is="components[key]" v-bind="props" />
</template>