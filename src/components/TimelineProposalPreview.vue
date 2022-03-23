<script setup>
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import removeMd from 'remove-markdown';
import { useIntl } from '@/composables/useIntl';

const {
  formatNumber,
  formatCompactNumber,
  formatPercentNumber,
  getRelativeProposalPeriod
} = useIntl();

const props = defineProps({
  proposal: Object,
  profiles: Object
});

// shortening to twice the allowed character limit (140*2) before removing markdown
// due to a bug in remove-markdown: https://github.com/stiang/remove-markdown/issues/52
// until this is fixed we need to avoid applying that function to very long texts with a lot of markdown
// see also: TimelineProposal.vue
const body = computed(() => removeMd(shorten(props.proposal.body, 280)));

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);
</script>

<template>
  <div class="transition-colors md:border-b last:border-b-0 border-skin-border">
    <router-link
      class="p-4 block text-skin-text"
      :to="{
        name: 'spaceProposal',
        params: { key: proposal.space.id, id: proposal.id }
      }"
    >
      <div>
        <div class="mb-2 flex items-center space-x-1">
          <router-link
            class="text-skin-text group"
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
          <AvatarUser
            :address="proposal.author"
            :profile="profiles[proposal.author]"
            :proposal="proposal"
            only-username
          />
          <BaseBadge
            :address="proposal.author"
            :members="proposal.space.members"
          />
        </div>
        <h3 v-text="proposal.title" class="mt-1 mb-1 break-words" />
        <p v-text="shorten(body, 120)" class="break-words mb-2 text-md" />
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
            class="mt-1 w-full relative"
          >
            <div class="absolute leading-[43px] ml-3 text-skin-link">
              <BaseIcon
                name="check1"
                size="20"
                class="mr-1 -ml-1 align-middle"
                v-if="i === winningChoice"
              />
              {{ shorten(choice, 32) }}
              <span class="text-skin-text ml-1">
                {{ formatCompactNumber(proposal.scores[i]) }}
                {{ proposal.space.symbol }}
              </span>
            </div>
            <div
              v-text="
                formatPercentNumber(
                  (1 / proposal.scores_total) * proposal.scores[i]
                )
              "
              class="absolute right-0 leading-[40px] mr-3 text-skin-link"
            />
            <div
              :style="`width: ${
                (100 / proposal.scores_total) * proposal.scores[i]
              }%;`"
              class="bg-skin-border rounded-md h-[40px]"
            />
          </div>
        </div>
        <div class="flex items-center">
          <LabelProposalState :state="proposal.state" slim class="mr-2" />
          {{ $t(`proposals.states.${proposal.state}`)
          }}<span v-if="proposal.scores_state !== 'final'"
            >,
            {{
              getRelativeProposalPeriod(
                proposal.state,
                proposal.start,
                proposal.end
              )
            }}</span
          ><span v-if="proposal.scores_state === 'final'"
            >, {{ formatNumber(proposal.votes) }} votes
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>
