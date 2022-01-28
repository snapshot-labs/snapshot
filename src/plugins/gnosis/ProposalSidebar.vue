<script setup>
import { usePlugins } from '@/composables/usePlugins';

const { pluginIndex } = usePlugins();

defineProps({ proposal: Object });
</script>

<template>
  <Block
    v-if="proposal.plugins?.gnosis?.baseTokenAddress"
    :title="pluginIndex.gnosis.name"
  >
    <PluginGnosisCustomBlock
      :proposalConfig="proposal.plugins.gnosis"
      :choices="proposal.choices"
    />
  </Block>
</template>
