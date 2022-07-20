<script setup lang="ts">
import { Proposal, Vote } from '@/helpers/interfaces';
import { getChoiceString } from '@/helpers/utils';

const format = getChoiceString;

defineProps<{
  proposal: Proposal;
  vote: Vote;
}>();
</script>

<template>
  <div class="flex-auto truncate px-2 text-center text-skin-link">
    <i-ho-lock-closed
      v-if="proposal.privacy === 'shutter' && proposal.scores_state !== 'final'"
      v-tippy="{ content: $t('privacy.shutter.tooltip') }"
      class="mx-auto cursor-help"
    />

    <div
      v-else
      v-tippy="{
        content:
          format(proposal, vote.choice).length > 24
            ? format(proposal, vote.choice)
            : null
      }"
      class="truncate text-center text-skin-link"
    >
      {{ format(proposal, vote.choice) }}
    </div>
  </div>
</template>
