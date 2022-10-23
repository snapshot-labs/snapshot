<script setup lang="ts">
import {
  ExtendedSpace,
  Proposal,
  Results,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: SpaceStrategy[];
  votes: Vote[];
  loaded: boolean;
}>();

const ts = Number((Date.now() / 1e3).toFixed());
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <SpaceProposalResultsList
      v-if="results"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
      :votes="votes"
    />

    <SpaceProposalResultsShutter
      v-if="proposal.privacy === 'shutter'"
      class="pt-2"
    />
  </BaseBlock>
</template>
