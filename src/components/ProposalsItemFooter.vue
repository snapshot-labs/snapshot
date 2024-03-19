<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import { Proposal } from '@/helpers/interfaces';

defineProps<{
  proposal: Proposal;
}>();

const { getRelativeProposalPeriod, formatPercentNumber } = useIntl();
</script>

<template>
  <div class="mt-3">
    <span
      v-tippy="{
        content: new Date(
          (proposal.state === 'pending' ? proposal.start : proposal.end) * 1000
        ).toUTCString()
      }"
      class="cursor-help"
    >
      {{
        capitalize(
          getRelativeProposalPeriod(
            proposal.state,
            proposal.start,
            proposal.end
          )
        )
      }}
    </span>
    <template
      v-if="
        proposal.quorum &&
        proposal.scores_total &&
        proposal.quorumType === 'default'
      "
    >
      -
      {{ formatPercentNumber(Number(proposal.scores_total / proposal.quorum)) }}
      {{ $t('quorumReached') }}
    </template>
    <template
      v-else-if="
        proposal.quorum &&
        proposal.scores_total &&
        proposal.quorumType === 'optimistic'
      "
    >
      -
      {{
        formatPercentNumber(
          Number(
            proposal.scores
              .filter((c, i) => i === 1)
              .reduce((a, b) => a + b, 0) / proposal.quorum
          )
        )
      }}
      {{ $t('quorumRejection') }}
    </template>
  </div>
</template>
