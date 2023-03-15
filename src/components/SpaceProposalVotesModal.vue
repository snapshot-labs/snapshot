<script setup lang="ts">
import { ref, toRefs, computed, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';
import { useScroll } from '@vueuse/core';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';
import { useProfiles, useWeb3, useInfiniteLoader } from '@/composables';
import { getProposalVotes } from '@/helpers/snapshot';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  votes: Vote[];
  strategies: SpaceStrategy[];
  userVote: Vote | null;
  open: boolean;
}>();

defineEmits(['loadVotes', 'close']);

const { web3Account } = useWeb3();

const votes = ref<Vote[]>([]);
const votesScrollWrapper = ref<HTMLElement | null>(null);
const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);
const voteQuery = ref('');
const sortedVotes = computed(() => {
  const votesClone = clone(votes.value);
  if (props.userVote) votesClone.push(props.userVote);
  const uniqVotes = uniqBy(votesClone, 'ipfs' as any);
  if (uniqVotes.map(vote => vote.voter).includes(web3Account.value)) {
    uniqVotes.unshift(
      uniqVotes.splice(
        uniqVotes.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
  } else {
    uniqVotes.sort((a, b) => b.balance - a.balance);
  }
  return uniqVotes;
});

const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
);

function openReceiptModal(iphsHash) {
  authorIpfsHash.value = iphsHash;
  modalReceiptOpen.value = true;
}

const { profiles, loadProfiles } = useProfiles();

watch(sortedVotes, () => {
  loadProfiles(sortedVotes.value.map(vote => vote.voter));
});

const { loadBy, loadMore, loadingMore } = useInfiniteLoader(20);

function formatProposalVotes(votes) {
  if (!votes.length) return [];
  return votes.map(vote => {
    vote.balance = vote.vp;
    vote.scores = vote.vp_by_strategy;
    return vote;
  });
}

async function loadMoreVotes() {
  const votesObj = await getProposalVotes(props.proposal.id, {
    first: loadBy,
    skip: votes.value.length
  });
  votes.value = votes.value.concat(formatProposalVotes(votesObj));
}

const { arrivedState } = useScroll(votesScrollWrapper, {
  throttle: 500,
  offset: {
    bottom: 300
  }
});

const { bottom } = toRefs(arrivedState);

watch(
  () => [props.open, bottom.value],
  to => {
    if (props.open && to) {
      loadMore(loadMoreVotes);
    }
  },
  {
    immediate: true
  }
);

// watch(
//   () => props.votes,
//   to => {
//     if (to.length > 0) {
//       votes.value = [...to];
//     }
//   }
// );

watch(
  () => props.open,
  to => {
    if (!to) {
      votes.value = [...props.votes];
    }
  }
);

loadMoreVotes();
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
        :model-value="voteQuery"
        :placeholder="$t('searchPlaceholder')"
        :focus-on-mount="true"
        class="w-full flex-auto px-3 pb-3"
      />
      <div
        ref="votesScrollWrapper"
        class="flex h-full flex-col overflow-auto border-t"
        :style="{ maxHeight: '450px' }"
      >
        <SpaceProposalVotesListItem
          v-for="(vote, i) in sortedVotes"
          :key="i"
          :vote="vote"
          :profiles="profiles"
          :space="space"
          :proposal="proposal"
          :titles="titles"
          :class="{ '!border-0': i === 0 }"
          :data-testid="`proposal-votes-list-item-${i}`"
          @open-receipt-modal="openReceiptModal"
        />
        <a
          class="block min-h-[50px] rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
          @click="loadMore(loadMoreVotes)"
        >
          <LoadingSpinner v-if="loadingMore" />
        </a>
      </div>
    </div>
    <teleport to="#modal">
      <ModalReceipt
        :open="modalReceiptOpen"
        :author-ipfs-hash="authorIpfsHash"
        @close="modalReceiptOpen = false"
      />
    </teleport>
  </BaseModal>
</template>
