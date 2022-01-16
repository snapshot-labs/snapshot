<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
</script>

<template>
  <Block :title="pluginIndex.gnosis.name">
    <PluginGnosisCustomBlock
      v-if="proposal.plugins?.gnosis?.baseTokenAddress"
      :proposalConfig="proposal.plugins.gnosis"
      :choices="proposal.choices"
    />
  </Block>
</template>
