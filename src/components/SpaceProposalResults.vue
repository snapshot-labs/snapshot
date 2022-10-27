<script setup lang="ts">
import { computed } from 'vue';
import {
  ExtendedSpace,
  Proposal,
  Results,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: SpaceStrategy[];
  votes: Vote[];
  loaded: boolean;
  isAdmin: boolean;
  loadingResultsFailed: boolean;
}>();

const emit = defineEmits(['reload']);

const ts = Number((Date.now() / 1e3).toFixed());

const isPendingScore = computed(
  () =>
    props.proposal.scores_state === 'pending' &&
    props.proposal.state === 'closed'
);
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <SpaceProposalResultsError
      v-if="loadingResultsFailed || isPendingScore"
      :is-admin="isAdmin"
      :proposal="proposal"
      :is-pending="isPendingScore"
      @reload="emit('reload')"
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
