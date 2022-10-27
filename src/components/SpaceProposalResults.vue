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
  isAdmin: boolean;
  loadingResultsFailed: boolean;
}>();

const emit = defineEmits(['retry']);

const ts = Number((Date.now() / 1e3).toFixed());
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <SpaceProposalResultsError
      v-if="loadingResultsFailed"
      :is-admin="isAdmin"
      :proposal-id="proposal.id"
      :proposal-state="proposal.scores_state"
      @retry="emit('retry')"
    />
    <template v-else>
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
    </template>
  </BaseBlock>
</template>
