<script setup lang="ts">
import { computed } from 'vue';
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';

import { useQuorum, useI18n } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  votes: Vote[];
}>();

const { totalQuorumScore } = useQuorum(props);
const { t } = useI18n();

const quorum = computed(
  () => props.proposal?.quorum || props.space.voting?.quorum || 0
);

const warningEstimateQuorumShutter = computed(() =>
  props.proposal.privacy !== 'shutter' ||
  props.proposal.scores_state === 'final'
    ? ''
    : t('proposal.quorum.warningOnlyEstimateQuorum')
);
</script>

<template>
  <div class="pt-2">
    <ProgressQuorum
      v-if="proposal.quorum || space.voting?.quorum"
      :score="totalQuorumScore"
      :total="quorum"
      :warning="warningEstimateQuorumShutter"
    />

    <SpaceProposalResultsQuorumPlugin
      v-else-if="space?.plugins?.quorum"
      v-bind="props"
      :warning="warningEstimateQuorumShutter"
    />
  </div>
</template>
