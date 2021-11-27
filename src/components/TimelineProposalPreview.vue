<script setup>
import { watchEffect, computed } from 'vue';
import { useUsername } from '@/composables/useUsername';
import removeMd from 'remove-markdown';

const props = defineProps({
  proposal: Object,
  profiles: Object
});

const body = computed(() => removeMd(props.proposal.body));

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);

const period = computed(() => {
  if (props.proposal.state === 'closed') return 'endedAgo';
  if (props.proposal.state === 'active') return 'endIn';
  return 'startIn';
});

const { address, profile, username } = useUsername();

watchEffect(() => {
  address.value = props.proposal.author;
  profile.value = props.profiles[props.proposal.author];
});
</script>

<template>
  <div class="transition-colors border-b">
    <router-link
      class="p-4 block text-color"
      :to="{
        name: 'spaceProposal',
        params: { key: proposal.space.id, id: proposal.id }
      }"
    >
      <div>
        <div class="mb-2">
          <Token :space="proposal.space" size="28" />
          <span class="ml-2" v-text="proposal.space.name" />
          {{ $tc('proposalBy', [username]) }}
          <Badges
            :address="proposal.author"
            :members="proposal.space.members"
          />
        </div>
        <h3 v-text="proposal.title" class="mt-1 mb-1" />
        <UiState :state="proposal.state" class="inline-block mb-3" />
        <div
          v-if="
            proposal.scores_state === 'final' &&
            proposal.scores_total > 0 &&
            proposal.choices.length <= 4
          "
          class="mb-3"
        >
          <div
            v-for="(choice, i) in proposal.choices"
            :key="i"
            class="mt-1 w-full relative"
          >
            <div
              v-text="_shorten(choice, 32)"
              class="absolute leading-[42px] ml-3 link-color"
            />
            <div
              v-text="
                _n((1 / proposal.scores_total) * proposal.scores[i], '0.[0]%')
              "
              class="absolute right-0 leading-[40px] mr-3 link-color"
            />
            <div
              :style="`width: ${
                (100 / proposal.scores_total) * proposal.scores[i]
              }%;`"
              class="bg-[color:var(--border-color)] rounded-md h-[40px]"
            />
          </div>
        </div>
        <div>
          <span
            v-if="proposal.scores_state !== 'final'"
            v-text="$tc(period, [_ms(proposal.start), _ms(proposal.end)])"
          />
          <span v-if="proposal.scores_state === 'final'" class="mt-2">
            {{ _n(proposal.votes, '0,00') }} votes
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>
