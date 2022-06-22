<script setup lang="ts">
import { onMounted } from 'vue';
import { formatEther } from '@ethersproject/units';
import { usePlugins } from '@/composables/usePlugins';
import { useBoost } from './useBoost';

const props = defineProps<{
  space: Record<string, any>;
  proposal: Record<string, any>;
}>();

const { pluginIndex } = usePlugins();
const { loadBoosts, boosts } = useBoost();

onMounted(() => {
  loadBoosts(props.proposal.id);
});
</script>

<template>
  <BaseBlock v-if="boosts.length" :title="pluginIndex.boost.name">
    <div v-for="boost in boosts" :key="boost.id">
      Boost balance: {{ formatEther(boost.balance) }}
    </div>
  </BaseBlock>
</template>
