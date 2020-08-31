<template>
  <span
    v-if="web3.blockNumber"
    class="State"
    :class="state.class"
    v-text="state.name"
  />
</template>

<script>
export default {
  props: {
    proposal: Object,
    namespace: Object
  },
  computed: {
    state() {
      const ts = (Date.now() / 1e3).toFixed();
      const { start, end } = this.proposal.msg.payload;
      if (ts > end && this.namespace.passed.includes(this.proposal.authorIpfsHash)) return { name: 'Passed', class: 'bg-green' };
      if (ts > end && this.namespace.failed.includes(this.proposal.authorIpfsHash)) return { name: 'Failed', class: 'bg-red' };
      if (ts > end) return { name: 'Closed', class: 'bg-purple' };
      if (ts > start) return { name: 'Active', class: 'bg-yellow' };
      return { name: 'Pending' };
    }
  }
};
</script>
