<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

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
    <BaseMessage
      v-if="
        proposal.scores_state !== 'final' && space.voting.privacy === 'shutter'
      "
      level="info"
    >
      {{ $t('resultsShutter') }}
      <div class="mt-3">
        <BaseLink link="https://shutter.network/" hide-external-icon>
          <span class="text-sm"> {{ $t('poweredBy') }} </span>
          <i-s-shutter class="-mt-1 h-[40px] w-[130px]" />
        </BaseLink>
      </div>
    </BaseMessage>
    <ProposalResultsList
      v-else-if="results"
      :space="space"
      :proposal="proposal"
      :results="results"
      :strategies="strategies"
    />
  </BaseBlock>
</template>
