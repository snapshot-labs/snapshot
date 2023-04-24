<script setup lang="ts">
import {
  ExtendedSpace,
  Proposal,
  Results,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results | null;
  strategies: SpaceStrategy[];
  loaded: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits(['reload']);

const ts = Number((Date.now() / 1e3).toFixed());

const isInvalidScore = computed(
  () =>
    props.proposal?.scores_state === 'invalid' &&
    props.proposal.state === 'closed'
);

const isPendingScore = computed(
  () =>
    props.proposal?.scores_state === 'pending' &&
    props.proposal.state === 'closed'
);
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <SpaceProposalResultsError
      v-if="isInvalidScore || isPendingScore"
      :is-admin="isAdmin"
      :proposal="proposal"
      :is-pending="isPendingScore"
      :is-invalid="isInvalidScore"
      @reload="emit('reload')"
    />
    <template v-else>
      <SpaceProposalResultsList
        v-if="results"
        :space="space"
        :proposal="proposal"
        :results="results"
        :strategies="strategies"
      />
      <SpaceProposalResultsShutter
        v-if="proposal.privacy === 'shutter'"
        class="pt-2"
      />
    </template>
  </BaseBlock>
</template>
