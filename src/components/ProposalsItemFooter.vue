<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
}>();

const { getRelativeProposalPeriod, formatPercentNumber } = useIntl();
const quorumText = computed(() => {
  if (!props.proposal.quorum || !props.proposal.scores_total) {
    return '';
  }

  const quorumOfRejection = props.proposal.quorumType === 'rejection';
  const percentage = formatPercentNumber(
    quorumOfRejection
      ? Number(
          props.proposal.scores
            .filter((c, i) => i === 1)
            .reduce((a, b) => a + b, 0) / props.proposal.quorum
        )
      : Number(props.proposal.scores_total / props.proposal.quorum)
  );
  return quorumOfRejection
    ? `${percentage} quorum rejection`
    : `${percentage} quorum reached`;
});
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
    <template v-if="proposal.quorum && proposal.scores_total">
      -
      {{ quorumText }}
    </template>
  </div>
</template>
