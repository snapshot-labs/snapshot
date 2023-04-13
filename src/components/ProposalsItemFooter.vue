<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import { Proposal } from '@/helpers/interfaces';

const { getRelativeProposalPeriod, formatPercentNumber, formatCompactNumber } =
  useIntl();

defineProps<{
  proposal: Proposal;
}>();
</script>

<template>
  <div class="mt-3">
    {{
      capitalize(
        getRelativeProposalPeriod(proposal.state, proposal.start, proposal.end)
      )
    }}
    <template v-if="proposal.quorum && proposal.scores_total">
      -
      {{
        formatPercentNumber(
          Number(formatCompactNumber(proposal.scores_total / proposal.quorum))
        )
      }}
      {{ $t('quorumReached') }}
    </template>
  </div>
</template>
