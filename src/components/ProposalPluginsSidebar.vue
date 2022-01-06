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
    <PluginAragonCustomBlock
      :loaded="loadedResults"
      :id="id"
      :space="space"
      :proposal="proposal"
      :results="results"
    />
    <PluginGnosisCustomBlock
      v-if="proposal.plugins?.gnosis?.baseTokenAddress"
      :proposalConfig="proposal.plugins.gnosis"
      :choices="proposal.choices"
    />
    <PluginQuorumCustomBlock
      :loaded="loadedResults"
      v-if="space.plugins?.quorum && !space?.voting?.quorum"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
    />
    <PluginPOAPCustomBlock
      v-if="space.plugins?.poap"
      :loaded="loadedResults"
      :space="space"
      :proposal="proposal"
      :results="results"
      :votes="votes"
      :strategies="strategies"
    />
  </div>
</template>
