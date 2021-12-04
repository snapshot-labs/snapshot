<script setup>
import { ref, computed, watch, toRefs } from 'vue';
import { getChoiceString } from '@/helpers/utils';
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

const format = getChoiceString;

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

watch(votes, () => {
  const votesWithUser = uniqBy(clone(props.votes).concat(props.userVote), 'id');

  if (votesWithUser.map(vote => vote.voter).includes(web3Account.value)) {
    votesWithUser.unshift(
      votesWithUser.splice(
        votesWithUser.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
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
    <div
      v-for="(vote, i) in sortedVotes.slice(0, 10)"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-t flex"
    >
      <User
        :profile="profiles[vote.voter]"
        :address="vote.voter"
        :space="space"
        :proposal="proposal"
        class="column"
      />
      <div class="flex-auto text-center link-color">
        <span
          class="text-center link-color"
          v-tippy="{
            content:
              format(proposal, vote.choice).length > 24
                ? format(proposal, vote.choice)
                : null
          }"
        >
          {{ _shorten(format(proposal, vote.choice), 24) }}
        </span>
      </div>

      <div class="column text-right link-color">
        <span
          v-tippy="{
            content: vote.scores
              .map((score, index) => `${_n(score)} ${titles[index]}`)
              .join(' + ')
          }"
        >
          {{ `${_n(vote.balance)} ${_shorten(space.symbol, 'symbol')}` }}
        </span>
        <a
          @click="openReceiptModal(vote)"
          target="_blank"
          class="ml-2 text-color"
          title="Receipt"
        >
          <Icon name="signature" />
        </a>
      </div>
    </div>
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
        @recipe="openReceiptModal"
        :open="modalVotesOpen"
        :votes="votes"
        :proposal="proposal"
        :space="space"
        :titles="titles"
        :voteCount="voteCount"
      />
    </teleport>
  </Block>
</template>
