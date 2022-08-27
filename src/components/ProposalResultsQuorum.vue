<script setup lang="ts">
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';

import { useIntl } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  votes: Vote[];
}>();

const { formatCompactNumber } = useIntl();
</script>

<template>
  <div v-if="proposal.quorum || space.voting?.quorum" class="text-skin-link">
    {{ $t('settings.quorum.label') }}
    <span class="float-right">
      {{ formatCompactNumber(results.scoresTotal) }} /
      {{ formatCompactNumber(proposal?.quorum || space.voting?.quorum || 0) }}
    </span>
  </div>

  <ProposalResultsQuorumPlugin
    v-else-if="space?.plugins?.quorum"
    v-bind="props"
  />
</template>
