<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useIntersectionObserver } from '@vueuse/core';
import { watchDebounced } from '@vueuse/core';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

const VOTES_FILTERS_DEFAULT = {
  voter: '',
  orderDirection: 'desc',
  onlyWithReason: false
};

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close']);

const { resolveName } = useResolveName();
const {
  userPrioritizedVotes,
  loadingVotes,
  loadingMoreVotes,
  profiles,
  noVotesFound,
  loadVotes,
  loadMoreVotes
} = useProposalVotes(props.proposal, 20);

const votesEndEl = ref<HTMLElement | null>(null);

const filterOptions = ref(clone(VOTES_FILTERS_DEFAULT));

const filters = computed(() => {
  return {
    voter: filterOptions.value.voter,
    orderDirection: filterOptions?.value?.orderDirection || 'desc',
    onlyWithReason: filterOptions?.value?.onlyWithReason || false
  };
});

useIntersectionObserver(
  votesEndEl,
  ([{ isIntersecting }]) => {
    if (props.open && isIntersecting && filterOptions.value.voter === '') {
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
  }
);

watchDebounced(
  filters,
  async val => {
    filterOptions.value.voter = '';
    noVotesFound.value = false;

    const voter = val?.voter;
    if (voter?.length) {
      const response = await resolveName(voter);
      filterOptions.value.voter = response || voter;

      if (!filterOptions.value.voter) {
        noVotesFound.value = true;
        return;
      }
    }

    loadVotes(filters.value);
  },
  { debounce: 300, deep: true }
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
          v-model="filterOptions.voter"
          :placeholder="$t('searchPlaceholderVotes')"
          modal
          focus-on-mount
          class="w-full px-3 pb-3"
        >
          <template #after>
            <SpaceProposalVotesFilters
              v-model="filterOptions"
              :proposal="proposal"
            />
          </template>
        </BaseSearch>
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div
        v-if="loadingVotes"
        class="block px-4 pt-4"
        :style="{ minHeight: maxHeight }"
      >
        <LoadingList />
      </div>
      <div
        v-else-if="noVotesFound"
        class="flex flex-row content-start items-start justify-center pt-4"
        :style="{ minHeight: maxHeight }"
      >
        <span>{{ $t('noResultsFound') }}</span>
      </div>
      <div v-else>
        <Transition name="fade">
          <div
            class="flex h-full min-h-full flex-col overflow-auto"
            :style="{ minHeight: maxHeight }"
          >
            <SpaceProposalVotesListItem
              v-for="(vote, i) in userPrioritizedVotes"
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
    </template>
  </BaseModal>
</template>
