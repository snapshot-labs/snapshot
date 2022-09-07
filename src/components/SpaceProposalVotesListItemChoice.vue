<script setup lang="ts">
import { Proposal, Vote } from '@/helpers/interfaces';
import { getChoiceString } from '@/helpers/utils';
import voting from '@snapshot-labs/snapshot.js/src/voting';

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

    <i-ho-exclamation
      v-else-if="
        !voting[proposal.type].isValidChoice(vote.choice, proposal.choices)
      "
      v-tippy="{ content: $t('proposal.invalidChoice') }"
      class="mx-auto cursor-help"
    />

    <div
      v-else
      v-tippy="{
        content: format(proposal, vote.choice)
      }"
      class="truncate text-center text-skin-link"
    >
      {{ format(proposal, vote.choice) }}
    </div>
  </div>
</template>
