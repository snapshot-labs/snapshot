<script setup>
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import removeMd from 'remove-markdown';
import { useIntl } from '@/composables/useIntl';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();

const {
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatCompactNumber,
  formatPercentNumber
} = useIntl();

const props = defineProps({
  proposal: Object,
  profiles: Object,
  space: Object
});

const body = computed(() => removeMd(props.proposal.body));

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);

const relativePeriod = computed(() => {
  const now = new Date() / 1e3;
  if (props.proposal.state === 'closed') {
    return t('endedAgo', [formatRelativeTime(props.proposal.end)]);
  }
  if (props.proposal.state === 'active') {
    return t('proposalTimeLeft', [formatDuration(props.proposal.end - now, t)]);
  }
  return t('startIn', [formatRelativeTime(props.proposal.start)]);
});
</script>

<template>
  <div class="transition-colors border-b last:border-b-0">
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
              <Token :space="proposal.space" size="28" />
              <span
                class="ml-2 group-hover:text-skin-link"
                v-text="proposal.space.name"
              />
            </div>
          </router-link>
          <User
            :address="proposal.author"
            :profile="profiles[proposal.author]"
            :space="space"
            :proposal="proposal"
            only-username
          />
          <span v-text="$tc('proposalBy', [username])" />
          <Badges
            :address="proposal.author"
            :members="proposal.space.members"
          />
        </div>
        <h3 v-text="proposal.title" class="mt-1 mb-1" />
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
              <Icon
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
              class="bg-[color:var(--border-color)] rounded-md h-[40px]"
            />
          </div>
        </div>
        <div class="flex items-center">
          <UiState :state="proposal.state" slim class="mr-2" />
          {{ $t(`proposals.states.${proposal.state}`)
          }}<span v-if="proposal.scores_state !== 'final'"
            >, {{ relativePeriod }}</span
          ><span v-if="proposal.scores_state === 'final'"
            >, {{ formatNumber(proposal.votes) }} votes
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>
