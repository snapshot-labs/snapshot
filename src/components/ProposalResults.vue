<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { useIntl } from '@/composables/useIntl';
const { formatCompactNumber } = useIntl();

defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results | null;
  strategies: { name: string; network: string; params: Record<string, any> }[];
  loaded: boolean;
}>();

const ts = Number((Date.now() / 1e3).toFixed());
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
    class="pb-2"
  >
    <div
      v-if="results && (proposal.quorum || space.voting?.quorum)"
      class="text-skin-link"
    >
      {{ $t('settings.quorum.label') }}
      <span class="float-right">
        {{ formatCompactNumber(results.scoresTotal) }} /
        {{
          formatCompactNumber(
            proposal.quorum || (space.voting.quorum as number)
          )
        }}
      </span>
    </div>
    <ProposalMessageShutter
      v-if="
        space.voting.privacy === 'shutter' && proposal.scores_state !== 'final'
      "
      class="mt-4"
    />
    <ProposalResultsList
      v-else-if="results"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
    />
  </BaseBlock>
</template>
