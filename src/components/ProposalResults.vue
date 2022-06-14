<script setup lang="ts">
import { computed } from 'vue';
import { useIntl } from '@/composables/useIntl';
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const { formatCompactNumber } = useIntl();

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: { name: string; network: string; params: Record<string, any> }[];
  loaded: boolean;
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

const ts = Number((Date.now() / 1e3).toFixed());
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <div class="space-y-3">
      <ProposalResultsItem
        v-for="choice in choices"
        :key="choice.i"
        :choice="choice"
        :space="space"
        :proposal="proposal"
        :results="results"
        :strategies="strategies"
      />
      <div
        v-if="proposal.quorum || space.voting?.quorum"
        class="text-skin-link"
      >
        {{ $t('settings.quorum.label') }}
        <span class="float-right">
          {{ formatCompactNumber(results.sumOfResultsBalance) }} /
          {{ formatCompactNumber(proposal.quorum || space.voting.quorum as number) }}
        </span>
      </div>
    </div>
  </BaseBlock>
</template>
