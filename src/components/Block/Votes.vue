<script setup>
import { ref, computed, watch, toRefs } from 'vue';
import { useProfiles } from '@/composables/useProfiles';
import { useWeb3 } from '@/composables/useWeb3';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import uniqBy from 'lodash/uniqBy';

const props = defineProps({
  space: Object,
  proposal: Object,
  votes: Array,
  loaded: Boolean,
  strategies: Object,
  userVote: Array
});

const { votes, proposal } = toRefs(props);
const { web3 } = useWeb3();

const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);
const modalVotesOpen = ref(false);

const web3Account = computed(() => web3.value.account);
const voteCount = computed(() =>
  proposal.value.scores_state === 'final'
    ? proposal.value.votes
    : votes.value.length
);

const sortedVotes = ref([]);

const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol)
);

function isZero() {
  if (!props.loaded) return true;
  if (props.votes.length > 0) return true;
}

function openReceiptModal(vote) {
  authorIpfsHash.value = vote.ipfs;
  // this.relayerIpfsHash = vote.relayerIpfsHash;
  modalReceiptOpen.value = true;
}

const { profiles, loadProfiles } = useProfiles();

watch([votes, web3Account], () => {
  const votesWithUser = uniqBy(clone(props.votes).concat(props.userVote), 'id');

  if (votesWithUser.map(vote => vote.voter).includes(web3Account.value)) {
    votesWithUser.unshift(
      votesWithUser.splice(
        votesWithUser.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
  } else {
    votesWithUser.sort((a, b) => b.balance - a.balance);
  }
  sortedVotes.value = votesWithUser;
});

watch(sortedVotes, () => {
  loadProfiles(sortedVotes.value.map(vote => vote.voter));
});
</script>

<template>
  <Block
    v-if="isZero()"
    :title="$t('votes')"
    :counter="voteCount"
    :slim="true"
    :loading="!loaded"
  >
    <VotesRow
      @receipt="openReceiptModal"
      :votes="sortedVotes.slice(0, 10)"
      :proposal="proposal"
      :space="space"
      :titles="titles"
      :profiles="profiles"
    />
    <a
      v-if="votes.length > 5"
      @click="modalVotesOpen = true"
      class="
        px-4
        py-3
        border-t
        text-center
        block
        header-bg
        rounded-b-none
        md:rounded-b-md
      "
    >
      {{ $t('allVotes') }}
    </a>
    <teleport to="#modal">
      <ModalReceipt
        :open="modalReceiptOpen"
        @close="modalReceiptOpen = false"
        :authorIpfsHash="authorIpfsHash"
      />
      <ModalVotes
        @close="modalVotesOpen = false"
        @receipt="openReceiptModal"
        :open="modalVotesOpen"
        :votes="votes"
        :proposal="proposal"
        :space="space"
        :titles="titles"
      />
    </teleport>
  </Block>
</template>
