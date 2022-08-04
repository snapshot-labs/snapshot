<script setup lang="ts">
import { useIntl } from '@/composables';
import { Proposal } from '@/helpers/interfaces';

defineProps<{
  proposal: Proposal;
}>();

const { formatNumber, getRelativeProposalPeriod } = useIntl();
</script>

<template>
  <div class="flex items-center pl-[3px]">
    <LabelProposalState :state="proposal.state" slim class="mr-[8px]" />
    {{ $t(`proposals.states.${proposal.state}`) }}
    <span v-if="proposal.scores_state !== 'final'"
      >,
      {{
        getRelativeProposalPeriod(proposal.state, proposal.start, proposal.end)
      }}
    </span>
    <span v-if="proposal.scores_state === 'final'"
      >, {{ formatNumber(proposal.votes) }} votes
    </span>
  </div>
</template>
