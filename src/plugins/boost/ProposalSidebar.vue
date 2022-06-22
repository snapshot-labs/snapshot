<script setup>
import { onMounted } from 'vue';
import { usePlugins } from '@/composables/usePlugins';
import { useBoost } from './useBoost';

const props = defineProps({
  proposal: Object,
  space: Object
});

const { pluginIndex } = usePlugins();
const { loadBoosts, boosts } = useBoost();

onMounted(() => {
  loadBoosts(props.proposal.id);
});
</script>

<template>
  <BaseBlock v-if="space.plugins.boost" :title="pluginIndex.boost.name">
    <div v-for="boost in boosts" :key="boost.id">
      {{ JSON.stringify(boost) }}
    </div>
  </BaseBlock>
</template>
