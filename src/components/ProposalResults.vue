<script setup lang="ts">
import { computed } from 'vue';
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';
import { useIntl } from '@/composables/useIntl';
const { formatCompactNumber } = useIntl();

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results | null;
  votes: Vote[];
  strategies: { name: string; network: string; params: Record<string, any> }[];
  loaded: boolean;
}>();

const ts = Number((Date.now() / 1e3).toFixed());

const quorumScore = computed(() => {
  let scores = 0;
  if (
    props.proposal.privacy === 'shutter' &&
    props.proposal.scores_state !== 'final'
  )
    scores = props.votes.reduce((a, b) => a + b.balance, 0);
  else if (props.results) scores = props.results.scoresTotal;

  return formatCompactNumber(scores);
});
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <div class="space-y-3">
      <ProposalResultsList
        v-if="results"
        :space="space"
        :proposal="proposal"
        :results="results"
        :strategies="strategies"
      />

      <div
        v-if="results && (proposal.quorum || space.voting?.quorum)"
        class="text-skin-link"
      >
        {{ $t('settings.quorum.label') }}
        <span class="float-right">
          {{ quorumScore }} /
          {{
            formatCompactNumber(
              proposal.quorum || (space.voting.quorum as number)
            )
          }}
        </span>
      </div>
    </div>
    <ProposalResultsShutter
      v-if="proposal.privacy === 'shutter' && proposal.scores_state !== 'final'"
      class="pt-2"
    />
  </BaseBlock>
</template>
