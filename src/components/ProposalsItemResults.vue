<script setup lang="ts">
import { computed } from 'vue';
import { Proposal } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';

import { useIntl } from '@/composables';

const { formatCompactNumber, formatPercentNumber } = useIntl();

const props = defineProps<{
  proposal: Proposal;
}>();

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);
</script>

<template>
  <div>
    <div
      v-for="(choice, i) in proposal.choices"
      :key="i"
      class="relative mt-1 w-full"
    >
      <div
        class="absolute ml-3 flex items-center leading-[43px] text-skin-link"
      >
        <i-ho-check v-if="i === winningChoice" class="mr-2 -ml-1 text-sm" />
        {{ shorten(choice, 32) }}
        <span class="ml-1 text-skin-text">
          {{ formatCompactNumber(proposal.scores[i]) }}
          {{ proposal.symbol || proposal.space.symbol }}
        </span>
      </div>
      <div
        class="absolute right-0 mr-3 leading-[40px] text-skin-link"
        v-text="
          formatPercentNumber((1 / proposal.scores_total) * proposal.scores[i])
        "
      />
      <div
        :style="`width: ${
          (100 / proposal.scores_total) * proposal.scores[i]
        }%;`"
        class="h-[40px] rounded-md bg-skin-border"
      />
    </div>
  </div>
</template>
