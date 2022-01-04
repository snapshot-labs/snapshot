<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  space: Object,
  proposal: Object,
  votes: Object,
  loadedResults: Boolean
});

const emit = defineEmits(['update:safeSnapInput']);

// Legacy structure of proposal.plugins.safeSnap (safeSnapInput):
// safeSnap: {
//   txs: [
//     [batch0tx0, batch0tx1, ...],
//     [batch1tx0, batch1tx1, ...],
//   ],
// }
//
// New structure:
// (stores reality module contract address and network ID in the proposal to allow
// updates of the space config without breaking existing proposals)
// safeSnap: {
//   safes: [
//     {
//       network: networkId,
//       realityAddress: 0x...,
//       txs: [
//         [batch0tx0, batch0tx1, ...],
//         [batch1tx0, batch1tx1, ...],
//       ],
//     },
//     ...
//   ]
// }

</script>

<template>
  <div>
    <PluginChartsCustomBlock
      v-if="loadedResults && space.plugins?.charts"
      :space="space"
      :proposal="proposal"
      :votes="votes"
    />
    <PluginCommentBoxCustomBlock
      v-if="space.plugins?.commentBox"
      :proposalId="id"
      :proposal="proposal"
      :space="space"
    />
  </div>
</template>
