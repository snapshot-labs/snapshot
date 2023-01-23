<script setup lang="ts">
import { computed } from 'vue';
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';

import { useQuorum } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  votes: Vote[];
}>();

const { totalQuorumScore } = useQuorum(props);

const quorum = computed(
  () => props.proposal?.quorum || props.space.voting?.quorum || 0
);
</script>

<template>
  <div class="pt-2">
    <ProgressQuorum
      v-if="proposal.quorum || space.voting?.quorum"
      :score="totalQuorumScore"
      :total="quorum"
    />

    <SpaceProposalResultsQuorumPlugin
      v-else-if="space?.plugins?.quorum"
      v-bind="props"
    />
  </div>
</template>
