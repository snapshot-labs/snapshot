<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const props = defineProps<{
  id: string;
  proposal: Proposal;
  space: ExtendedSpace;
  results: Results;
  loadedResults: boolean;
  strategies: Record<string, any>[];
}>();

const { getPluginComponents } = usePlugins();
const components = getPluginComponents(
  'Proposal',
  Object.keys(props.space.plugins)
);

const showPlugin = computed(() => {
  if (props.space.plugins.hasOwnProperty('oSnap'))
    return props.proposal.plugins.hasOwnProperty('oSnap');
  else return true;
});
</script>

<template>
  <div v-if="showPlugin">
    <component
      :is="component"
      v-for="(component, key) in components"
      :key="key"
      v-bind="props"
    />
  </div>
</template>
