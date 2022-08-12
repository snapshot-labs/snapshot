<script setup lang="ts">
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';

import { useIntl, useQuorum } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  votes: Vote[];
}>();

const { formatCompactNumber, formatPercentNumber } = useIntl();
const { quorum, totalScore, totalVotingPower } = useQuorum(props);
</script>

<template>
  <div class="mb-1 text-skin-link">
    <span class="mr-1">
      {{ formatCompactNumber(totalScore) }} /
      {{ formatCompactNumber(totalVotingPower) }}
      {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
    </span>
    <span class="float-right" v-text="formatPercentNumber(quorum)" />
  </div>
</template>
