<script setup lang="ts">
import { computed } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import DisplaySafeTransactions from './components/DisplaySafeTransactions.vue';

const props = defineProps<{
  proposal: Proposal;
}>();

const mapLegacyConfig = (config: Record<string, any>): Record<string, any> => {
  if (config.safes) {
    // it's the new config format...
    return {
      ...config,
      safes: config.safes.map(safe => {
        return {
          ...safe,
          // but still I want "txs" to be called "batches"
          // because otherwise it's safe->txs->txs which is confusing naming
          batches: safe.txs
        };
      })
    };
  }

  return {
    ...config,
    safes: [
      {
        network: props.proposal.space.network,
        realityAddress: props.proposal.space.plugins.safeSnap.address,
        // Some legacy proposals have a plain array of transactions instead
        // of the current two-dimensional structure for batches.
        batches:
          config.txs[0] && !Array.isArray(config.txs[0])
            ? [config.txs]
            : config.txs
      }
    ]
  };
};

const executionData = computed(
  () => mapLegacyConfig(props.proposal.plugins.safeSnap) || {}
);
</script>

<template>
  <BaseBlock
    v-if="executionData.safes.some(s => s.txs.length > 0)"
    :title="$t('safeSnap.transactions')"
    slim
  >
    <DisplaySafeTransactions
      v-for="(safe, index) in executionData.safes"
      :key="index"
      :proposal="proposal"
      :safe="safe"
    />
  </BaseBlock>
</template>
