<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results | null;
  strategies: { name: string; network: string; params: Record<string, any> }[];
  loaded: boolean;
}>();

const ts = Number((Date.now() / 1e3).toFixed());
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
    class="pb-2"
  >
    <ProposalMessageShutter
      v-if="
        space.voting.privacy === 'shutter' && proposal.scores_state !== 'final'
      "
    />
    <ProposalResultsList
      v-else-if="results"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
    />
  </BaseBlock>
</template>
