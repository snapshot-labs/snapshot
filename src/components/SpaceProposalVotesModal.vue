<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useIntersectionObserver, watchDebounced } from '@vueuse/core';
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
  <TuneModal :open="open" @close="$emit('close')">
    <div class="px-3 pb-3">
      <TuneModalTitle as="h4" class="mt-3 flex items-center gap-1">
        {{ $t('proposal.votesModal.title') }}
        <BaseCounter :counter="proposal.votes" />
      </TuneModalTitle>
    </div>
    <BaseSearch
      v-model="searchInput"
      :placeholder="$t('searchPlaceholderVotes')"
      modal
      focus-on-mount
      class="max-h-[56px] w-full !px-3 pb-3"
    >
      <template #after>
        <SpaceProposalVotesFilters
          v-if="!searchInput"
          v-model="filterOptions"
          :proposal="proposal"
        />
      </template>
    </BaseSearch>

    <div class="max-h-[calc(100vh-130px)] md:max-h-[400px] overflow-y-auto">
      <div v-if="loadingVotes" class="block p-3">
        <LoadingList />
      </div>

      <BaseNoResults v-else-if="showNoResults" />

      <div v-else-if="votes.length">
        <div
          class="flex h-full min-h-full flex-col overflow-auto px-[16px] py-2"
        >
          <SpaceProposalVotesItem
            v-for="(vote, i) in votes"
            :key="i"
            :vote="vote"
            :profiles="profiles"
            :space="space"
            :proposal="proposal"
            is-small
            :data-testid="`proposal-votes-list-item-${i}`"
          />
          <div ref="votesEndEl" />
          <div v-if="loadingMoreVotes" class="block min-h-[34px] text-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    </div>
  </TuneModal>
</template>
