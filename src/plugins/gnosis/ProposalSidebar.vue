<script setup>
import GnosisCustomBlock from './components/CustomBlock.vue';
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
</script>

<template>
  <BaseBlock
    v-if="proposal.plugins?.gnosis?.baseTokenAddress"
    :title="pluginIndex.gnosis.name"
  >
    <GnosisCustomBlock
      :proposalConfig="proposal.plugins.gnosis"
      :choices="proposal.choices"
    />
  </BaseBlock>
</template>
