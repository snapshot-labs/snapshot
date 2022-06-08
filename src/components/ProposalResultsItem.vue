<script setup lang="ts">
import { computed, ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const { formatCompactNumber, formatPercentNumber, formatNumber } = useIntl();

const props = defineProps<{
  choice: { i: number; choice: string };
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: { name: string; network: string; params: Record<string, any> }[];
}>();

const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
);

const getPercentage = (n, max) => (max ? ((100 / max) * n) / 1e2 : 0);

const hideAbstain = props.space?.voting?.hideAbstain ?? false;

const choicePercentage = computed(() => {
  if (props.proposal.type === 'basic' && hideAbstain) {
    if (props.choice.i === 0)
      return getPercentage(
        props.results.resultsByVoteBalance[0],
        props.results.resultsByVoteBalance[0] +
          props.results.resultsByVoteBalance[1]
      );

    if (props.choice.i === 1)
      return getPercentage(
        props.results.resultsByVoteBalance[1],
        props.results.resultsByVoteBalance[0] +
          props.results.resultsByVoteBalance[1]
      );
  }

  return getPercentage(
    props.results.resultsByVoteBalance[props.choice.i],
    props.results.sumOfResultsBalance
  );
});

const choiceString = ref<HTMLElement | null>(null);

const isTruncated = computed(() => {
  if (!choiceString.value) return false;
  return choiceString.value.scrollWidth > choiceString.value.clientWidth;
});

const isVisible = computed(() => {
  if (props.proposal.type === 'basic' && hideAbstain) {
    if (props.choice.i === 2) return false;
  }
  return true;
});
</script>

<template>
  <div v-if="isVisible">
    <div class="mb-1 flex justify-between text-skin-link">
      <div class="flex overflow-hidden">
        <span
          ref="choiceString"
          v-tippy="{
            content: isTruncated ? choice.choice : null
          }"
          class="mr-1 truncate"
          v-text="choice.choice"
        />
      </div>
      <div class="flex justify-end space-x-2">
        <span
          v-tippy="{
            content: results.resultsByStrategyScore[choice.i]
              .map((score, index) => `${formatNumber(score)} ${titles[index]}`)
              .join(' + ')
          }"
          class="whitespace-nowrap"
        >
          {{ formatCompactNumber(results.resultsByVoteBalance[choice.i]) }}
          {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
        </span>
        <span v-text="formatPercentNumber(choicePercentage)" />
      </div>
    </div>

    <ProposalResultsProgressBar
      :value="results.resultsByStrategyScore[choice.i]"
      :max="
        proposal.type === 'basic' && hideAbstain
          ? results.resultsByVoteBalance[0] + results.resultsByVoteBalance[1]
          : results.sumOfResultsBalance
      "
    />
  </div>
</template>
