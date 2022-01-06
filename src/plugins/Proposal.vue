<script setup>
import { computed } from 'vue';
import { usePlugins } from '@/composables/usePlugins';

const { components, addComponents } = usePlugins('Proposal');

addComponents(['safeSnap', 'charts']);

const props = defineProps({
  proposal: Object,
  space: Object,
  votes: Object,
  loadedResults: Object
});

const plugins = computed(() => Object.assign(props.space.plugins || {}, props.proposal.plugins || {}))
</script>

<template>
  <component
    v-for="(plugin, key) in plugins"
    :key="key"
    :is="components[key]"
    v-bind="props"
  />
</template>
