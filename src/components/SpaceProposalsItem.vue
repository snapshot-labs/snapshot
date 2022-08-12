<script setup lang="ts">
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import removeMd from 'remove-markdown';
import { Proposal, ExtendedSpace, Profile } from '@/helpers/interfaces';
import { useIntl } from '@/composables';

const { formatCompactNumber } = useIntl();

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: Profile };
  space: ExtendedSpace;
  voted: boolean;
}>();

const body = computed(() => removeMd(props.proposal.body));

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);
</script>

<template>
  <BaseBlock slim class="transition-colors md:hover:border-skin-text">
    <router-link
      class="block p-3 text-skin-text sm:p-4"
      :to="{
        name: 'spaceProposal',
        params: { key: proposal.space.id, id: proposal.id }
      }"
    >
      <div>
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center space-x-1">
            <BaseUser
              :address="proposal.author"
              :profile="profiles[proposal.author]"
              :space="space"
              :proposal="proposal"
            />
          </div>
          <LabelProposalState :state="proposal.state" />
        </div>

        <ProposalItemTitle :proposal="proposal" :voted="voted" />

        <ProposalItemBody v-if="body">
          {{ body }}
        </ProposalItemBody>

        <span
          v-if="proposal.scores_state === 'final'"
          class="mt-2 flex items-center space-x-1"
        >
          <i-ho-check class="text-[17px] text-green" />
          <span>
            {{ shorten(proposal.choices[winningChoice], 64) }} -
            {{ formatCompactNumber(proposal.scores[winningChoice]) }}
            {{ proposal.symbol || proposal.space.symbol }}
          </span>
        </span>
      </div>
    </router-link>
  </BaseBlock>
</template>
