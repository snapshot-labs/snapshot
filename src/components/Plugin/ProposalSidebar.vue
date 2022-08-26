<script setup lang="ts">
import { usePlugins } from '@/composables/usePlugins';
import {
  ExtendedSpace,
  Proposal,
  Results,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  id: string;
  proposal: Proposal;
  space: ExtendedSpace;
  results: Results;
  loadedResults: boolean;
  votes: Vote[];
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
