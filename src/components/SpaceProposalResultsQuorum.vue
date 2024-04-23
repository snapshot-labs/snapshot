<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
}>();

const { totalQuorumScore, quorum, quorumType, loadingQuorum } =
  useQuorum(props);

const { formatCompactNumber, formatPercentNumber } = useIntl();
</script>

<template>
  <div class="pt-2 text-skin-link">
    <div class="flex justify-between">
      <div class="flex items-center gap-1">
        {{ quorumType === 'rejection' ? 'Quorum of rejection' : 'Quorum' }}
      </div>
      <LoadingSpinner v-if="loadingQuorum" class="mr-1" />
      <div v-else class="flex gap-2">
        <i-ho-check
          v-if="
            quorum && quorumType === 'default' && totalQuorumScore >= quorum
          "
          class="text-green"
        />
        <i-ho-x
          v-if="
            quorum && quorumType === 'rejection' && totalQuorumScore >= quorum
          "
          class="text-red"
        />

        <span
          v-tippy="{ content: formatPercentNumber(totalQuorumScore / quorum) }"
        >
          {{ formatCompactNumber(totalQuorumScore) }}
          /
          {{ formatCompactNumber(quorum) }}
        </span>
      </div>
    </div>
    <BaseProgressBar :value="(totalQuorumScore / quorum) * 100" />
  </div>
</template>
