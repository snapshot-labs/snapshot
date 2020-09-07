<template>
  <Block
    v-if="Object.keys(votes).length > 0"
    title="Votes"
    :counter="Object.keys(votes).length"
    :slim="true"
  >
    <div
      v-for="(vote, address, i) in visibleVotes"
      :key="i"
      :style="i === 0 && 'border: 0 !important;'"
      class="px-4 py-3 border-top d-flex"
    >
      <User :address="address" :space="space" class="column" />
      <div
        v-text="proposal.msg.payload.choices[vote.msg.payload.choice - 1]"
        class="flex-1 text-center text-white"
      />
      <div class="flex-auto text-right">
        <!-- If one token, load space symbol -->
        <span
          v-if="titles.length === 1"
          v-text="
            `${_numeral(vote.balance)} ${_shorten(space.symbol, 'symbol')}`
          "
          class="text-white"
        />
        <!-- Else If more tokens, load strategy symbols -->
        <template v-if="titles.length > 1">
          <span
            class="mr-1 token-results"
            v-for="(tokenScore, tokenIndex) of vote.scores"
            :key="titles[tokenIndex]"
          >
            {{ _numeral(tokenScore) }}
            <Token
              :space="space.key"
              :symbol="titles[tokenIndex]"
              class="mx-1"
            />
            <span v-show="tokenIndex !== vote.scores.length - 1">
              +
            </span>
          </span>
        </template>
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
      class="px-4 py-3 border-top text-center d-block bg-gray-dark"
    >
      See more
    </a>
    <ModalReceipt
      :open="modalReceiptOpen"
      @close="modalReceiptOpen = false"
      :authorIpfsHash="authorIpfsHash"
      :relayerIpfsHash="relayerIpfsHash"
    />
  </Block>
</template>

<script>
export default {
  props: ['space', 'proposal', 'votes'],
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
        ? this.votes
        : Object.fromEntries(Object.entries(this.votes).slice(0, 10));
    },
    titles() {
      if (!this.space.strategies) return [this.space.symbol];
      return this.space.strategies.map(strategy => strategy[1].symbol);
    }
  },
  methods: {
    openReceiptModal(vote) {
      this.authorIpfsHash = vote.authorIpfsHash;
      this.relayerIpfsHash = vote.relayerIpfsHash;
      this.modalReceiptOpen = true;
    }
  }
};
</script>
