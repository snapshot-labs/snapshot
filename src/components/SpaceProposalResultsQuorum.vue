<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
}>();

const { totalQuorumScore, quorum, loadingQuorum } = useQuorum(props);
const { formatCompactNumber, formatPercentNumber } = useIntl();
</script>

<template>
  <div class="pt-2 text-skin-link">
    <div class="flex justify-between">
      <div class="flex items-center gap-1">
        {{ $t('settings.quorum.label') }}
      </div>
      <LoadingSpinner v-if="loadingQuorum" class="mr-1" />
      <div v-else class="flex gap-2">
        <i-ho-check
          v-if="quorum && totalQuorumScore >= quorum"
          class="text-skin-success text-green"
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
