<template>
  <Block
    v-if="isZero()"
    :title="$t('votes')"
    :counter="votes.length"
    :slim="true"
    :loading="!loaded"
  >
    <div
      v-for="(vote, i) in visibleVotes"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-top d-flex"
    >
      <User
        :profile="vote.profile"
        :address="vote.voter"
        :space="space"
        class="column"
      />
      <div class="flex-auto text-center text-white">
        <span
          :aria-label="format(proposal, vote.choice)"
          class="text-center text-white tooltipped tooltipped-multiline tooltipped-n"
        >
          {{ _shorten(format(proposal, vote.choice), 24) }}
        </span>
      </div>

      <div class="column text-right text-white">
        <span
          class="tooltipped tooltipped-multiline tooltipped-n"
          :aria-label="
            vote.scores
              .map((score, index) => `${_n(score)} ${titles[index]}`)
              .join(' + ')
          "
        >
          {{ `${_n(vote.balance)} ${_shorten(space.symbol, 'symbol')}` }}
        </span>
        <a
          @click="openReceiptModal(vote)"
          target="_blank"
          class="ml-2 text-gray"
          title="Receipt"
        >
          <Icon name="signature" />
        </a>
      </div>
    </div>
    <a
      v-if="!showAllVotes && votes.length > 10"
      @click="showAllVotes = true"
      class="px-4 py-3 border-top text-center d-block bg-gray-dark rounded-bottom-0 rounded-md-bottom-2"
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

<script>
import { getChoiceString } from '@/helpers/utils';

export default {
  props: ['space', 'proposal', 'votes', 'loaded', 'strategies'],
  data() {
    return {
      showAllVotes: false,
      authorIpfsHash: '',
      modalReceiptOpen: false
    };
  },
  computed: {
    visibleVotes() {
      return this.showAllVotes
        ? this.sortVotesUserFirst()
        : this.sortVotesUserFirst().slice(0, 10);
    },
    titles() {
      return this.strategies.map(strategy => strategy.params.symbol);
    }
  },
  methods: {
    isZero() {
      if (!this.loaded) return true;
      if (this.votes.length > 0) return true;
    },
    openReceiptModal(vote) {
      this.authorIpfsHash = vote.id;
      // this.relayerIpfsHash = vote.relayerIpfsHash;
      this.modalReceiptOpen = true;
    },
    sortVotesUserFirst() {
      const votes = this.votes;
      if (votes.map(vote => vote.voter).includes(this.web3.account)) {
        votes.unshift(
          votes.splice(
            votes.findIndex(item => item.voter === this.web3.account),
            1
          )[0]
        );
        return votes;
      }
      return this.votes;
    },
    format: getChoiceString
  }
};
</script>
