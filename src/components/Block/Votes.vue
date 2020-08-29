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
      <User :address="address" :namespace="namespace" class="column" />
      <div
        v-text="proposal.msg.payload.choices[vote.msg.payload.choice - 1]"
        class="flex-auto text-center text-white"
      />
      <div class="column text-right">
        <span
          v-text="
            `${_numeral(vote.balance)} ${namespace.symbol ||
              _shorten(namespace.token)}`
          "
          class="text-white"
        />
        <a
          @click="openReceiptModal(vote)"
          target="_blank"
          class="ml-3 text-gray"
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
  props: ['namespace', 'proposal', 'votes'],
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
