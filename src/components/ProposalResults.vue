<script setup lang="ts">
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';

import { useIntl, useQuorum } from '@/composables';

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results | null;
  votes: Vote[];
  strategies: { name: string; network: string; params: Record<string, any> }[];
  loaded: boolean;
}>();

const { formatCompactNumber } = useIntl();
const { quorumScore } = useQuorum();

const ts = Number((Date.now() / 1e3).toFixed());
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
          {{
            quorumScore({
              proposal,
              results,
              votes
            })
          }}
          /
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
