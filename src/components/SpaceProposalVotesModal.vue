<script setup lang="ts">
import { ref, toRefs, computed, watch } from 'vue';
import { shorten } from '@/helpers/utils';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';
import { useScroll } from '@vueuse/core';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';
import {
  useProfiles,
  useWeb3,
  useIntl,
  useInfiniteLoader
} from '@/composables';
import { getProposalVotes } from '@/helpers/snapshot';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  votes: Vote[];
  loaded: boolean;
  strategies: SpaceStrategy[];
  userVote: Vote | null;
  loadingMore: boolean;
  open: boolean;
}>();

defineEmits(['loadVotes', 'close']);

const { formatCompactNumber } = useIntl();
const { web3Account } = useWeb3();

const votes = ref<Vote[]>([]);
const votesScrollWrapper = ref<HTMLElement | null>(null);
const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);
const voteQuery = ref('');

const voteCount = computed(() => props.proposal.votes);

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

function isZero() {
  if (!props.loaded) return true;
  if (votes.value.length > 0) return true;
}

function openReceiptModal(iphsHash) {
  authorIpfsHash.value = iphsHash;
  modalReceiptOpen.value = true;
}

const { profiles, loadProfiles } = useProfiles();

watch(sortedVotes, () => {
  loadProfiles(sortedVotes.value.map(vote => vote.voter));
});

const { loadBy, loadingMore, loadMore } = useInfiniteLoader(10);

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

watch(
  () => props.votes,
  to => {
    if (to.length > 0) {
      votes.value = [...to];
    }
  }
);

watch(
  () => props.open,
  to => {
    if (!to) {
      votes.value = [...props.votes];
    }
  }
);
</script>

<template>
  <BaseModal
    :open="open"
    max-height="500px"
    max-width="700px"
    @close="$emit('close')"
  >
    <template #header>
      <div
        class="flex flex-row content-center items-center justify-center gap-x-4 pl-4"
      >
        <h3>{{ $t('votes') }}</h3>
        <BaseSearch
          :model-value="voteQuery"
          :placeholder="$t('searchPlaceholder')"
          :autofocus="true"
          class="flex-auto pr-2"
        />
      </div>
    </template>
    <div class="flex w-full flex-col">
      <div
        ref="votesScrollWrapper"
        class="flex h-full flex-col overflow-auto"
        :style="{ maxHeight: '450px' }"
      >
        <div
          v-for="(vote, i) in sortedVotes"
          :key="i"
          :class="[
            'flex items-center border-t px-4 py-[14px]',
            { '!border-0': i === 0 }
          ]"
          :data-testid="`proposal-votes-list-item-${i}`"
        >
          <BaseUser
            :key="vote.voter"
            :profile="profiles[vote.voter]"
            :address="vote.voter"
            :space="space"
            :proposal="proposal"
            width-class="w-[110px] min-w-[110px] xs:w-[130px] xs:min-w-[130px] text-left"
          />

          <SpaceProposalVotesListItemChoice :proposal="proposal" :vote="vote" />
          <div
            class="flex w-[110px] min-w-[110px] items-center justify-end whitespace-nowrap text-right text-skin-link xs:w-[130px] xs:min-w-[130px]"
          >
            <span
              v-tippy="{
                content: vote.scores
                  ?.map(
                    (score, index) =>
                      `${formatCompactNumber(score)} ${titles[index]}`
                  )
                  .join(' + ')
              }"
            >
              {{
                `${formatCompactNumber(vote.balance)} ${shorten(
                  proposal.symbol || space.symbol,
                  'symbol'
                )}`
              }}
            </span>
            <BaseButtonIcon @click="openReceiptModal(vote.ipfs)">
              <BaseIcon name="signature" />
            </BaseButtonIcon>
            <BaseButtonIcon
              v-if="vote.reason !== '' && props.proposal.privacy !== 'shutter'"
              v-tippy="{
                content: vote.reason
              }"
              class="cursor-default p-0"
            >
              <i-ho-annotation class="text-[16px]" />
            </BaseButtonIcon>
          </div>
        </div>
        <a
          v-if="sortedVotes.length < voteCount"
          class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
          @click="loadMore(loadMoreVotes)"
        >
          <LoadingSpinner v-if="loadingMore" />
          <span v-else v-text="$t('seeMore')" />
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
