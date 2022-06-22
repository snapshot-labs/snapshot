<script setup lang="ts">
import { computed } from 'vue';
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber } = useIntl();

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: { name: string; network: string; params: Record<string, any> }[];
}>();

const choices = computed<{ i: number; choice: string }[]>(() =>
  props.proposal.choices
    .map((choice, i) => ({ i, choice }))
    .sort(
      (a, b) =>
        props.results.resultsByVoteBalance[b.i] -
        props.results.resultsByVoteBalance[a.i]
    )
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
    <div v-if="proposal.quorum || space.voting?.quorum" class="text-skin-link">
      {{ $t('settings.quorum.label') }}
      <span class="float-right">
        {{ formatCompactNumber(results.sumOfResultsBalance) }} /
        {{
          formatCompactNumber(
            proposal.quorum || (space.voting.quorum as number)
          )
        }}
      </span>
    </div>
  </div>
</template>
