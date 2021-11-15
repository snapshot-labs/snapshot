<script setup>
import { ref, computed, watch, toRefs } from 'vue';
import { getChoiceString } from '@/helpers/utils';
import { useProfiles } from '@/composables/useProfiles';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({
  space: Object,
  proposal: Object,
  votes: Object,
  loaded: Boolean,
  strategies: Object
});

const format = getChoiceString;

const { votes, proposal } = toRefs(props);
const { web3 } = useWeb3();

const authorIpfsHash = ref('');
const modalReceiptOpen = ref(false);

const web3Account = computed(() => web3.value.account);
const voteCount = computed(() =>
  proposal.value.scores_state === 'final'
    ? proposal.value.votes
    : votes.value.length
);
const nbrVisibleVotes = ref(10);

const displayMoreVotes = () => {
  // 10 if there are more votes left in votes.length otherwise, the remaining votes
  nbrVisibleVotes.value += 10;
};

const sortedVotes = ref([]);

const visibleVotes = computed(() =>
  sortedVotes.value.slice(0, nbrVisibleVotes.value)
);
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

const { profiles, updateAddressArray } = useProfiles();

watch(votes, () => {
  const votes = props.votes;
  if (votes.map(vote => vote.voter).includes(web3Account.value)) {
    votes.unshift(
      votes.splice(
        votes.findIndex(item => item.voter === web3Account.value),
        1
      )[0]
    );
  }
  sortedVotes.value = votes;
});

watch(nbrVisibleVotes, () => {
  updateAddressArray(
    sortedVotes.value.slice(0, nbrVisibleVotes.value).map(vote => vote.voter)
  );
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
      v-for="(vote, i) in visibleVotes"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-t flex"
    >
      <User
        :profile="profiles[vote.voter]"
        :address="vote.voter"
        :space="space"
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
      v-if="votes.length > 10 && nbrVisibleVotes < votes.length"
      @click="displayMoreVotes()"
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
      {{ $t('seeMore') }}
    </a>
    <teleport to="#modal">
      <ModalReceipt
        :open="modalReceiptOpen"
        @close="modalReceiptOpen = false"
        :authorIpfsHash="authorIpfsHash"
      />
    </teleport>
  </Block>
</template>
