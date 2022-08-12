<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';

import { useIntl } from '@/composables';

const { getRelativeProposalPeriod, formatPercentNumber, formatCompactNumber } =
  useIntl();

defineProps<{
  proposal: Proposal;
}>();
</script>

<template>
  <div class="mt-3">
    {{
      getRelativeProposalPeriod(proposal.state, proposal.start, proposal.end)
    }}
    <span v-if="proposal.quorum">
      -
      {{
        formatPercentNumber(
          Number(formatCompactNumber(proposal.scores_total / proposal.quorum))
        )
      }}
      {{ $t('quorumReached') }}
    </span>
  </div>
</template>
