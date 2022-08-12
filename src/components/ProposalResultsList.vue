<script setup lang="ts">
import { computed } from 'vue';
import {
  ExtendedSpace,
  Proposal,
  Results,
  SpaceStrategy,
  Vote
} from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: SpaceStrategy[];
  votes: Vote[];
}>();

const choices = computed<{ i: number; choice: string }[]>(() =>
  props.proposal.choices
    .map((choice, i) => ({ i, choice }))
    .sort((a, b) => props.results.scores[b.i] - props.results.scores[a.i])
);
</script>

<template>
  <div class="space-y-3">
    <ProposalResultsListItem
      v-for="choice in choices"
      :key="choice.i"
      :choice="choice"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
    />
    <ProposalResultsQuorum
      :space="space"
      :proposal="proposal"
      :results="results"
      :votes="votes"
    />
  </div>
</template>
