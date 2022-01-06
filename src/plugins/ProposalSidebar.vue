<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents } = usePlugins('ProposalSidebar');

addComponents([
  'Chainlink'
]);

const props = defineProps({
  proposal: Object,
  space: Object
});
</script>

<template>
  <component v-for="(plugin, key) in proposal.plugins" :is="components[key]" v-bind="props" />
</template>