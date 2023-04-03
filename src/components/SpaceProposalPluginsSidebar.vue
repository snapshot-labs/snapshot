<script setup lang="ts">
import {
  ExtendedSpace,
  Proposal,
  Results,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  id: string;
  proposal: Proposal;
  space: ExtendedSpace;
  results: Results;
  loadedResults: boolean;
  strategies: SpaceStrategy[];
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
