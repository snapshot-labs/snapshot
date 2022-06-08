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
// see also: BaseProposalItem.vue
const body = computed(() => removeMd(shorten(props.proposal.body, 280)));

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
        <h3 v-text="proposal.title" class="mt-1 mb-1 break-words" />
        <p v-text="shorten(body, 120)" class="mb-2 break-words text-md" />
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
            <div class="absolute ml-3 leading-[43px] text-skin-link">
              <BaseIcon
                name="check1"
                size="20"
                class="mr-1 -ml-1 align-middle"
                v-if="i === winningChoice"
              />
              {{ shorten(choice, 32) }}
              <span class="ml-1 text-skin-text">
                {{ formatCompactNumber(proposal.scores[i]) }}
                {{ proposal.symbol || proposal.space.symbol }}
              </span>
            </div>
            <div
              v-text="
                formatPercentNumber(
                  (1 / proposal.scores_total) * proposal.scores[i]
                )
              "
              class="absolute right-0 mr-3 leading-[40px] text-skin-link"
            />
            <div
              :style="`width: ${
                (100 / proposal.scores_total) * proposal.scores[i]
              }%;`"
              class="h-[40px] rounded-md bg-skin-border"
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
