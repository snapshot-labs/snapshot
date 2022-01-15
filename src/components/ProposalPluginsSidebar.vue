<script setup>
defineProps({
  id: String,
  space: Object,
  proposal: Object,
  results: Object,
  votes: Object,
  strategies: Object,
  loadedResults: Boolean
});
</script>

<template>
  <div>
    <PluginGnosisCustomBlock
      v-if="proposal.plugins?.gnosis?.baseTokenAddress"
      :proposalConfig="proposal.plugins.gnosis"
      :choices="proposal.choices"
    />
  </div>
</template>
