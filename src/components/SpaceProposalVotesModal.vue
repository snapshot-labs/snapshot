<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { useScroll } from '@vueuse/core';
import { useProposalVotesList } from '@/composables';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  strategies: SpaceStrategy[];
  userVote: Vote | null;
  open: boolean;
}>();

defineEmits(['close']);

const {
  votes,
  loadVotes,
  sortedVotes,
  loadMore,
  loadingMore,
  loadMoreVotes,
  profiles
} = useProposalVotesList(props.proposal, props.userVote);

const votesScrollWrapper = ref<HTMLElement | null>(null);
const votesQuery = ref('');

const { arrivedState } = useScroll(votesScrollWrapper, {
  throttle: 500,
  offset: {
    bottom: 300
  }
});

const { bottom } = toRefs(arrivedState);

watch(
  () => bottom.value,
  to => {
    if (props.open && to) {
      loadMore(loadMoreVotes);
    }
  },
  {
    immediate: false
  }
);

watch(
  () => props.open,
  to => {
    if (to) {
      loadVotes(20);
    } else {
      votes.value = [];
    }
  }
);
</script>

<template>
  <BaseModal
    :open="open"
    max-height="608px"
    max-width="608px"
    @close="$emit('close')"
  >
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('votes') }}</h3>
      </div>
    </template>
    <div class="flex w-full flex-col">
      <BaseSearch
        :model-value="votesQuery"
        :placeholder="$t('searchPlaceholder')"
        :focus-on-mount="true"
        class="w-full flex-auto px-3 pb-3"
      />
      <div
        ref="votesScrollWrapper"
        class="flex h-full flex-col overflow-auto border-t"
        :style="{ maxHeight: '450px', minHeight: '450px' }"
      >
        <SpaceProposalVotesListItem
          v-for="(vote, i) in sortedVotes"
          :key="i"
          :vote="vote"
          :profiles="profiles"
          :space="space"
          :proposal="proposal"
          :class="{ '!border-0': i === 0 }"
          :data-testid="`proposal-votes-list-item-${i}`"
        />
        <a
          class="block min-h-[50px] rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
        >
          <LoadingSpinner v-if="loadingMore" />
        </a>
      </div>
    </div>
  </BaseModal>
</template>
