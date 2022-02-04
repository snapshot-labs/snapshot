<script setup>
import { computed } from 'vue';

const props = defineProps({
  proposal: Object,
  space: Object,
  loadedResults: Boolean
});

const safeSnapInput = computed(() => {
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
});
</script>

<template>
  <PluginSafeSnapConfig
    v-if="proposal.plugins.safeSnap && loadedResults && safeSnapInput.safes"
    :modelValue="safeSnapInput"
    :proposal="proposal"
    :preview="true"
    :config="space.plugins?.safeSnap"
    :network="space.network"
    :spaceId="space.id"
  />
</template>
