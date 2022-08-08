<script setup lang="ts">
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import removeMd from 'remove-markdown';
import { Proposal, ExtendedSpace } from '@/helpers/interfaces';
import { useIntl } from '@/composables';

const { formatCompactNumber } = useIntl();

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: { ens: string; name?: string; about?: string } };
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
            <AvatarSpace :space="proposal.space" size="28" />
            <span class="!ml-2 hidden xs:block" v-text="proposal.space.name" />
            <span v-text="$tc('proposalBy')" />

            <BaseUser
              :address="proposal.author"
              :profile="profiles[proposal.author]"
              :space="space"
              :proposal="proposal"
              hide-avatar
            />
          </div>
          <LabelProposalVoted v-if="voted" />
        </div>
        <h3 class="my-1 break-words leading-7" v-text="proposal.title" />
        <p class="mb-2 break-words sm:text-md" v-text="shorten(body, 140)" />
        <div class="mb-3">
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
        <ProposalItemFooter :proposal="proposal" />
      </div>
    </router-link>
  </BaseBlock>
</template>
