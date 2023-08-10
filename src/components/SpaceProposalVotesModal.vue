<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useIntersectionObserver } from '@vueuse/core';
import { watchDebounced } from '@vueuse/core';
import { ExtendedSpace, Proposal, VoteFilters } from '@/helpers/interfaces';

const VOTES_FILTERS_DEFAULT: VoteFilters = {
  orderDirection: 'desc',
  onlyWithReason: false
};

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close']);

const {
  votes,
  loadingVotes,
  loadingMoreVotes,
  profiles,
  loadVotes,
  loadMoreVotes,
  loadSingleVote
} = useProposalVotes(props.proposal, 20);

const votesEndEl = ref<HTMLElement | null>(null);
const filterOptions = ref<VoteFilters>(clone(VOTES_FILTERS_DEFAULT));
const searchInput = ref('');

const filters = computed(() => {
  return {
    orderDirection: filterOptions.value.orderDirection,
    onlyWithReason: filterOptions.value.onlyWithReason
  };
});

const showNoResults = computed(() => {
  return (
    !loadingVotes.value &&
    votes.value.length === 0 &&
    (searchInput.value || filters.value.onlyWithReason)
  );
});

useIntersectionObserver(
  votesEndEl,
  ([{ isIntersecting }]) => {
    const hasMoreVotes = props.proposal.votes > votes.value.length;
    if (
      props.open &&
      isIntersecting &&
      searchInput.value === '' &&
      hasMoreVotes
    ) {
      loadMoreVotes(filters.value);
    }
  },
  {
    threshold: 1
  }
);

watch(
  () => props.open,
  () => {
    filterOptions.value = clone(VOTES_FILTERS_DEFAULT);
    searchInput.value = '';
  }
);

watchDebounced(
  searchInput,
  async value => {
    if (value) {
      loadSingleVote(searchInput.value);
    }
    if (votes.value.length < 2 && value === '') {
      loadVotes(filters.value);
    }
  },
  { debounce: 300, deep: true }
);

watch(filters, value => {
  loadVotes(value);
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('proposal.votesModal.title') }}</h3>
        <BaseSearch
          v-model="searchInput"
          :placeholder="$t('searchPlaceholderVotes')"
          modal
          focus-on-mount
          class="max-h-[56px] w-full px-3 pb-3"
        >
          <template #after>
            <SpaceProposalVotesFilters
              v-if="!searchInput"
              v-model="filterOptions"
              :proposal="proposal"
            />
          </template>
        </BaseSearch>
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div :style="{ minHeight: maxHeight }">
        <div v-if="loadingVotes" class="block px-4 pt-4">
          <LoadingList />
        </div>

        <BaseNoResults v-else-if="showNoResults" />

        <div v-else-if="votes.length">
          <Transition name="fade">
            <div class="flex h-full min-h-full flex-col overflow-auto">
              <SpaceProposalVotesListItem
                v-for="(vote, i) in votes"
                :key="i"
                :vote="vote"
                :profiles="profiles"
                :space="space"
                :proposal="proposal"
                :class="{ '!border-0': i === 0 }"
                :data-testid="`proposal-votes-list-item-${i}`"
              />
              <div ref="votesEndEl" />
              <div
                class="block min-h-[50px] rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
              >
                <LoadingSpinner v-if="loadingMoreVotes" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
