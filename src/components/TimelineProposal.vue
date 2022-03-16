<script setup>
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import removeMd from 'remove-markdown';
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber, getRelativeProposalPeriod } = useIntl();

const props = defineProps({
  proposal: Object,
  profiles: Object,
  space: Object
});

// shortening to twice the allowed character limit (140*2) before removing markdown
// due to a bug in remove-markdown: https://github.com/stiang/remove-markdown/issues/52
// until this is fixed we need to avoid applying that function to very long texts with a lot of markdown
// see also: TimelineProposalPreview.vue
const body = computed(() => removeMd(shorten(props.proposal.body, 280)));

const winningChoice = computed(() =>
  props.proposal.scores.indexOf(Math.max(...props.proposal.scores))
);
</script>

<template>
  <BaseBlock slim class="transition-colors hover:border-skin-text">
    <router-link
      class="p-4 block text-skin-text"
      :to="{
        name: 'spaceProposal',
        params: { key: proposal.space.id, id: proposal.id }
      }"
    >
      <div>
        <div class="mb-2 flex justify-between items-center">
          <div class="flex items-center space-x-1">
            <SpaceAvatar :space="proposal.space" size="28" />
            <span class="!ml-2 hidden xs:block" v-text="proposal.space.name" />
            <span v-text="$tc('proposalBy')" />

            <UserAvatar
              :address="proposal.author"
              :profile="profiles[proposal.author]"
              :space="space"
              :proposal="proposal"
              only-username
            />
            <BaseBadge
              :address="proposal.author"
              :members="proposal.space.members"
            />
          </div>
          <UiState :state="proposal.state" />
        </div>
        <h3 v-text="proposal.title" class="my-1 break-words" />
        <p v-text="shorten(body, 140)" class="break-words mb-2 text-md" />
        <div>
          <span
            v-if="proposal.scores_state !== 'final'"
            v-text="
              getRelativeProposalPeriod(
                proposal.state,
                proposal.start,
                proposal.end
              )
            "
          />
          <span
            v-if="proposal.scores_state === 'final'"
            class="mt-2 flex space-x-1 items-center"
          >
            <BaseIcon size="20" name="check1" class="text-green" />
            <span
              >{{ shorten(proposal.choices[winningChoice], 64) }} -
              {{ formatCompactNumber(proposal.scores[winningChoice]) }}
              {{ proposal.space.symbol }}</span
            >
          </span>
        </div>
      </div>
    </router-link>
  </BaseBlock>
</template>
