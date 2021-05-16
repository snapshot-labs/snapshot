<template>
  <Block
    v-if="isZero()"
    :title="$t('votes')"
    :counter="Object.keys(votes).length"
    :slim="true"
    :loading="!loaded"
  >
    <div
      v-for="(vote, address, i) in visibleVotes"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-top d-flex"
    >
      <User
        :profile="vote.profile"
        :address="address"
        :space="space"
        class="column"
      />
      <div
        v-text="
          _shorten(proposal.choices[vote.msg.payload.choice - 1], 'choice')
        "
        class="flex-auto text-center text-white"
      />
      <div class="column text-right text-white">
        <span
          class="tooltipped tooltipped-n"
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
      v-if="!showAllVotes && Object.keys(votes).length > 10"
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
        :relayerIpfsHash="relayerIpfsHash"
      />
    </teleport>
  </Block>
</template>

<script>
export default {
  props: ['space', 'proposal', 'votes', 'loaded', 'strategies'],
  data() {
    return {
      showAllVotes: false,
      authorIpfsHash: '',
      relayerIpfsHash: '',
      modalReceiptOpen: false
    };
  },
  computed: {
    visibleVotes() {
      return this.showAllVotes
        ? this.sortVotesUserFirst()
        : Object.fromEntries(
            Object.entries(this.sortVotesUserFirst()).slice(0, 10)
          );
    },
    titles() {
      return this.strategies.map(strategy => strategy.params.symbol);
    }
  },
  methods: {
    // Hide only after loading if zero voters
    isZero() {
      if (!this.loaded) return true;
      if (Object.keys(this.votes).length > 0) return true;
    },
    openReceiptModal(vote) {
      this.authorIpfsHash = vote.authorIpfsHash;
      this.relayerIpfsHash = vote.relayerIpfsHash;
      this.modalReceiptOpen = true;
    },
    sortVotesUserFirst() {
      if (Object.keys(this.votes).includes(this.web3.account)) {
        const { [[this.web3.account]]: firstKeyValue, ...rest } = this.votes;
        return {
          [[this.web3.account]]: firstKeyValue,
          ...rest
        };
      }
      return this.votes;
    }
  }
};
</script>
