<template>
  <router-link
    class="px-4 py-3 border-top d-block text-gray"
    :to="{ name: 'proposal', params: { key: token, id: i } }"
  >
    <div>
      <State :proposal="proposal" class="d-inline-block mr-2 mb-2" />
      <h3 v-text="proposal.msg.payload.name" class="d-inline-block mb-1" />
    </div>
    <div>
      <span v-text="`#${i.slice(0, 7)}`" />
      By {{ _shorten(proposal.address) }} {{ _numeral(proposal.balance) }}
      {{ namespace.symbol }}
      <Icon v-if="isVerified" name="check" title="Verified" />
      start
      <span v-text="$d(proposal.msg.payload.start * 1e3)" />
      end
      <span v-text="$d(proposal.msg.payload.end * 1e3)" />
      <span v-if="wallets">
        -
        For
        <span v-text="forPerc" />%
        Against
        <span v-text="againstPerc" />%
      </span>
    </div>
  </router-link>
</template>

<script>
export default {
  data() {
    return {
      forPerc: 0,
      againstPerc: 0
    };
  },
  props: {
    namespace: Object,
    token: String,
    proposal: Object,
    wallets: Array,
    verified: Array,
    i: String
  },
  computed: {
    isVerified() {
      return (
        Array.isArray(this.verified) &&
        this.verified.length > 0 &&
        this.verified.includes(this.proposal.address)
      );
    }
  },
  async created() {
    if (!this.proposal) {
      return;
    }
    this.forPerc = (this.wallets[0] / this.proposal.balance) * 100;
    this.againstPerc = (this.wallets[1] / this.proposal.balance) * 100;
  }
};
</script>
