<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  space: Object,
  proposal: Object,
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
const safeSnapInput = computed({
  get: () => {
    const input = props.proposal.plugins.safeSnap || {};
    if (!input.safes && input.txs) {
      // map legacy format to new format
      return {
        ...input,
        safes: [
          {
            network: props.space.network,
            realityAddress: props.space.plugins?.safeSnap?.address,
            // Some legacy proposals have a plain array of transactions instead of the current two-dimensional structure for batches.
            txs:
              input.txs[0] && !Array.isArray(input.txs[0])
                ? [input.txs]
                : input.txs
          }
        ]
      };
    }

    return input;
  },
  set: value => emit('update:safeSnapInput', value)
});
</script>

<template>
  <div>
    <PluginSafeSnapConfig
      v-if="loadedResults && safeSnapInput.safes"
      v-model="safeSnapInput"
      :proposal="proposal"
      :preview="true"
      :config="space.plugins?.safeSnap"
      :network="space.network"
    />
    <PluginCommentBoxCustomBlock
      v-if="space.plugins?.commentBox"
      :proposalId="id"
      :proposal="proposal"
      :space="space"
    />
  </div>
</template>
