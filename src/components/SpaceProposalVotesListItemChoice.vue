<script setup lang="ts">
import { Proposal, Vote } from '@/helpers/interfaces';
import { getChoiceString } from '@/helpers/utils';
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { useTippy } from 'vue-tippy';
import TextAutolinker from './TextAutolinker.vue';

const format = getChoiceString;

const props = defineProps<{
  proposal: Proposal;
  vote: Vote;
}>();

const refReasonTooltip = ref();

useTippy(refReasonTooltip, {
  content: h(TextAutolinker, { text: `Reason: ${props.vote.reason}` }),
  interactive: true,
  theme: 'urlified',
  trigger: 'mouseenter focus click',
  delay: 100
});
</script>

<template>
  <div class="flex-auto truncate text-skin-link">
    <i-ho-lock-closed
      v-if="proposal.privacy === 'shutter' && proposal.scores_state !== 'final'"
      v-tippy="{ content: $t('privacy.shutter.tooltip') }"
      class="cursor-help"
    />

    <i-ho-exclamation
      v-else-if="
        !voting[proposal.type].isValidChoice(vote.choice, proposal.choices)
      "
      v-tippy="{ content: $t('proposal.invalidChoice') }"
      class="cursor-help"
    />

    <div v-else class="flex items-center gap-1">
      <div
        v-tippy="{
          content: format(proposal, vote.choice)
        }"
        class="truncate text-skin-link w-fit max-w-full"
      >
        {{ format(proposal, vote.choice) }}
      </div>
      <div
        v-if="vote.reason !== '' && proposal.privacy !== 'shutter'"
        ref="refReasonTooltip"
      >
        <BaseButtonIcon class="cursor-default !p-0">
          <i-ho-annotation class="text-[16px]" />
        </BaseButtonIcon>
      </div>
    </div>
  </div>
</template>
