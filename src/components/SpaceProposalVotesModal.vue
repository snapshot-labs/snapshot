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
  loadMore,
  loadingMore,
  loadedVotes,
  loadMoreVotes,
  profiles,
  clearVotes,
  votesNotFound,
  isENS,
  isResolvingEns,
  isWrongEns
} = useProposalVotes(props.proposal, 20, props.userVote, votesQuery);

const { arrivedState } = useScroll(votesScrollWrapper, {
  offset: {
    bottom: 60 * 10
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
      votesQuery.value = '';
      clearVotes();
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
          class="min-h-[60px] w-full flex-auto px-3 pb-3"
        >
          <template
            v-if="isENS && (isResolvingEns || isWrongEns)"
            #after="{ clearInput }"
          >
            <LoadingSpinner
              v-if="isENS && isResolvingEns && !isWrongEns"
              class="pb-[3px]"
            />
            <i-ho-x
              v-if="isENS && isWrongEns"
              class="cursor-pointer text-sm text-red"
              @click="clearInput"
            />
          </template>
        </BaseSearch>
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div
        v-if="!loadedVotes"
        class="block px-4 py-4"
        :style="{ height: maxHeight }"
      >
        <LoadingList />
      </div>
      <div
        v-if="loadedVotes && votesNotFound"
        class="flex flex-row content-start items-start justify-center py-4"
        :style="{ height: maxHeight }"
      >
        <span>{{ $t('noResultsFound') }}</span>
      </div>
      <Transition name="fade">
        <div
          v-if="loadedVotes && !votesNotFound"
          ref="votesScrollWrapper"
          class="flex h-full min-h-full flex-col overflow-auto"
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
          <div
            class="block min-h-[50px] rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
          >
            <LoadingSpinner v-if="loadingMore" />
          </div>
        </div>
      </Transition>
    </template>
  </BaseModal>
</template>
