<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { useScroll } from '@vueuse/core';
import { useProposalVotes } from '@/composables';
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

const votesScrollWrapper = ref<HTMLElement | null>(null);
const votesQuery = ref('');

const {
  votes,
  loadVotes,
  sortedVotes,
  loadMore,
  loadingMore,
  loadMoreVotes,
  profiles
} = useProposalVotes(props.proposal, props.userVote, votesQuery);

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
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('votes') }}</h3>
        <BaseSearch
          v-model="votesQuery"
          :placeholder="$t('searchPlaceholder')"
          :modal="true"
          :focus-on-mount="true"
          :not-update-route-query="true"
          class="w-full flex-auto px-3 pb-3"
        />
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div
        ref="votesScrollWrapper"
        class="flex h-full min-h-full flex-col overflow-auto border-t"
        :style="{ height: maxHeight }"
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
    </template>
  </BaseModal>
</template>
