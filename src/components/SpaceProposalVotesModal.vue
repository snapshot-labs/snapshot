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
  loadVotes,
  sortedVotes,
  searchVote,
  loadMore,
  loadingMore,
  loadedVotes,
  loadMoreVotes,
  profiles,
  clearVotes,
  noVotesFound,
  isResolvingEns
} = useProposalVotes(props.proposal, 20, props.userVote, votesQuery);

const { arrivedState } = useScroll(votesScrollWrapper, {
  offset: {
    bottom: 60 * 10
  }
});

const { bottom } = toRefs(arrivedState);

watch(
  () => bottom.value,
  val => {
    if (props.open && val) {
      loadMore(loadMoreVotes);
    }
  },
  {
    immediate: false
  }
);

watch(
  () => props.open,
  val => {
    votesQuery.value = '';
    clearVotes();
    if (val) loadVotes();
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
          class="min-h-[60px] w-full flex-auto px-3 pb-3"
        />
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div
        v-if="!loadedVotes || isResolvingEns"
        class="block px-4 pt-4"
        :style="{ height: maxHeight }"
      >
        <LoadingList />
      </div>
      <div
        v-else-if="noVotesFound"
        class="flex flex-row content-start items-start justify-center pt-4"
        :style="{ height: maxHeight }"
      >
        <span>{{ $t('noResultsFound') }}</span>
      </div>
      <div v-else>
        <Transition name="fade">
          <div
            ref="votesScrollWrapper"
            class="flex h-full min-h-full flex-col overflow-auto"
            :style="{ height: maxHeight }"
          >
            <SpaceProposalVotesListItem
              v-for="(vote, i) in searchVote.length ? searchVote : sortedVotes"
              :key="i"
              :vote="vote"
              :profiles="profiles"
              :space="space"
              :proposal="proposal"
              :class="{ '!border-0': i === 0 }"
              :data-testid="`proposal-votes-list-item-${i}`"
            />
            <div
              class="block min-h-[50px] rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
            >
              <LoadingSpinner v-if="loadingMore" />
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </BaseModal>
</template>
