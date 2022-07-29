<script setup lang="ts">
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import removeMd from 'remove-markdown';
import { useIntl } from '@/composables';
import { Proposal } from '@/helpers/interfaces';

const { formatCompactNumber, formatPercentNumber } = useIntl();

const props = defineProps<{
  proposal: Proposal;
  profiles: { [key: string]: { ens: string; name?: string; about?: string } };
  voted: boolean;
}>();

const body = computed(() => removeMd(props.proposal.body));

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);
</script>

<template>
  <div class="border-skin-border transition-colors last:border-b-0 md:border-b">
    <router-link
      class="block p-4 text-skin-text"
      :to="{
        name: 'spaceProposal',
        params: { key: proposal.space.id, id: proposal.id }
      }"
    >
      <div>
        <div class="flex justify-between">
          <div class="mb-2 flex items-center space-x-1">
            <router-link
              class="group text-skin-text"
              :to="{
                name: 'spaceProposals',
                params: { key: proposal.space.id }
              }"
            >
              <div class="flex items-center">
                <AvatarSpace :space="proposal.space" size="28" />
                <span
                  class="ml-2 group-hover:text-skin-link"
                  v-text="proposal.space.name"
                />
              </div>
            </router-link>
            <span v-text="$tc('proposalBy')" />
            <BaseUser
              :address="proposal.author"
              :profile="profiles[proposal.author]"
              :proposal="proposal"
              :space="proposal.space"
              hide-avatar
            />
          </div>
          <div>
            <LabelProposalVoted v-if="voted" />
          </div>
        </div>
        <h3 class="mt-1 mb-1 break-words" v-text="proposal.title" />
        <p class="mb-2 break-words text-md" v-text="shorten(body, 120)" />
        <div
          v-if="
            proposal.scores_state === 'final' &&
            proposal.scores_total > 0 &&
            proposal.choices.length <= 6
          "
          class="mb-3"
        >
          <div
            v-for="(choice, i) in proposal.choices"
            :key="i"
            class="relative mt-1 w-full"
          >
            <div
              class="absolute ml-3 flex items-center leading-[43px] text-skin-link"
            >
              <i-ho-check
                v-if="i === winningChoice"
                class="mr-2 -ml-1 text-sm"
              />
              {{ shorten(choice, 32) }}
              <span class="ml-1 text-skin-text">
                {{ formatCompactNumber(proposal.scores[i]) }}
                {{ proposal.symbol || proposal.space.symbol }}
              </span>
            </div>
            <div
              class="absolute right-0 mr-3 leading-[40px] text-skin-link"
              v-text="
                formatPercentNumber(
                  (1 / proposal.scores_total) * proposal.scores[i]
                )
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
        <ProposalItemFooter :proposal="proposal" />
      </div>
    </router-link>
  </div>
</template>
