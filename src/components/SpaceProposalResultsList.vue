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
  results: Results;
  strategies: SpaceStrategy[];
}>();

const choices = computed<{ i: number; choice: string }[]>(() =>
  props.proposal.choices
    .map((choice, i) => ({ i, choice }))
    .sort((a, b) => props.results.scores[b.i] - props.results.scores[a.i])
);

const showQuorum = computed(
  () => props.proposal?.quorum || props.space?.plugins?.quorum
);
</script>

<template>
  <div class="space-y-3">
    <SpaceProposalResultsListItem
      v-for="choice in choices"
      :key="choice.i"
      :choice="choice"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
    />
    <SpaceProposalResultsQuorum
      v-if="showQuorum"
      :space="space"
      :proposal="proposal"
      :results="results"
    />
  </div>
</template>
