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
let refreshScoresInterval;

const refreshScores = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_HUB_URL}/api/scores/${props.proposal.id}`
  );

  const result = await response.json();

  if (result.result === true) {
    emit('reload');
  } else {
    clearInterval(refreshScoresInterval);
    refreshScoresInterval = setInterval(refreshScores, 5000);
  }
};

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

onMounted(() => {
  if (isPendingScore.value || isInvalidScore.value) {
    refreshScores();
  }
});

onBeforeUnmount(() => {
  clearInterval(refreshScoresInterval);
});
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
