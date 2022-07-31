<script setup lang="ts">
import Config from './components/Config.vue';
import { computed } from 'vue';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const mapLegacyConfig = (config: Record<string, any>): Record<string, any> => {
  if (config.safes) return config;

  return {
    ...config,
    safes: [
      {
        network: props.space.network,
        realityAddress: props.space.plugins.safeSnap.address,
        // Some legacy proposals have a plain array of transactions instead
        // of the current two-dimensional structure for batches.
        txs:
          config.txs[0] && !Array.isArray(config.txs[0])
            ? [config.txs]
            : config.txs
      }
    ]
  };
};

const safeSnapInput = computed(
  () => mapLegacyConfig(props.proposal.plugins.safeSnap) || {}
);
</script>

<template>
  <Config
    v-if="
      proposal.plugins.safeSnap &&
      safeSnapInput.safes.some(s => s.txs.length > 0)
    "
    :model-value="safeSnapInput"
    :proposal="proposal"
    :preview="true"
    :config="space.plugins.safeSnap"
    :network="space.network"
    :space-id="space.id"
  />
</template>
