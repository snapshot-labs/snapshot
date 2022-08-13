<script setup lang="ts">
import { ExtendedSpace, Proposal, Results, Vote } from '@/helpers/interfaces';

import { useIntl, useQuorum } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  votes: Vote[];
}>();

const { formatCompactNumber } = useIntl();
const { totalScore, totalVotingPower } = useQuorum(props);
</script>

<template>
  <div class="text-skin-link">
    <span class="mr-1">
      {{ $t('settings.quorum.label') }}
    </span>
    <span class="float-right">
      {{ formatCompactNumber(totalScore) }} /
      {{ formatCompactNumber(totalVotingPower) }}
    </span>
  </div>
</template>
