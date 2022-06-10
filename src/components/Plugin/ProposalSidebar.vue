<script setup lang="ts">
import { usePlugins } from '@/composables/usePlugins';
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const props = defineProps<{
  id: string;
  proposal: Proposal;
  space: ExtendedSpace;
  results: Results;
  loadedResults: boolean;
  votes: Record<string, any>[];
  strategies: Record<string, any>[];
}>();

const { getPluginComponents } = usePlugins();
const components = getPluginComponents(
  'ProposalSidebar',
  Object.keys(props.space.plugins)
);
</script>

<template>
  <component
    :is="component"
    v-for="(component, key) in components"
    :key="key"
    v-bind="props"
  />
</template>
