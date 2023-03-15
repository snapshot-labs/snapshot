<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';
import { useProfiles, useWeb3, useReportDownload } from '@/composables';
import { getProposalVotes } from '@/helpers/snapshot';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  strategies: SpaceStrategy[];
  userVote: Vote | null;
}>();

const { web3Account } = useWeb3();

const votes = ref<Vote[]>([]);
const loadedVotes = ref(false);
const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);
const modalVotesmOpen = ref(false);

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
  if (!loadedVotes.value) return true;
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

const { downloadVotes, isDownloadingVotes } = useReportDownload();

function formatProposalVotes(votes) {
  if (!votes.length) return [];
  return votes.map(vote => {
    vote.balance = vote.vp;
    vote.scores = vote.vp_by_strategy;
    return vote;
  });
}

async function loadVotes() {
  const votesRes = await getProposalVotes(props.proposal.id, {
    first: 6,
    space: props.proposal.space.id
  });

  votes.value = formatProposalVotes(votesRes);
  loadedVotes.value = true;
}

onMounted(() => {
  loadVotes();
});
</script>

<template>
  <BaseBlock
    v-if="isZero()"
    :title="$t('votes')"
    :counter="voteCount"
    :loading="!loadedVotes"
    slim
  >
    <template v-if="props.proposal.state === 'closed'" #button>
      <BaseButtonIcon>
        <LoadingSpinner v-if="isDownloadingVotes" />
        <i-ho-download
          v-else
          v-tippy="{ content: 'Download as CSV' }"
          @click="downloadVotes(proposal.id, proposal.space.id)"
        />
      </BaseButtonIcon>
    </template>
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
      v-if="sortedVotes.length < voteCount"
      class="block rounded-b-none border-t px-4 py-3 text-center md:rounded-b-md"
      @click="modalVotesmOpen = true"
    >
      <span v-text="$t('seeMore')" />
    </a>
    <teleport to="#modal">
      <ModalReceipt
        :open="modalReceiptOpen"
        :author-ipfs-hash="authorIpfsHash"
        @close="modalReceiptOpen = false"
      />
      <SpaceProposalVotesModal
        :space="space"
        :proposal="proposal"
        :votes="votes"
        :strategies="strategies"
        :user-vote="userVote"
        :open="modalVotesmOpen"
        @close="modalVotesmOpen = false"
      />
    </teleport>
  </BaseBlock>
</template>
