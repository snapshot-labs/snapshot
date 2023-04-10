<script setup>
import GnosisCustomBlock from './components/CustomBlock.vue';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
</script>

<template>
  <BaseBlock
    v-if="proposal.plugins?.gnosis?.baseTokenAddress"
    :title="pluginIndex.gnosis.name"
  >
    <GnosisCustomBlock
      :proposal-config="proposal.plugins.gnosis"
      :choices="proposal.choices"
    />
  </BaseBlock>
</template>
