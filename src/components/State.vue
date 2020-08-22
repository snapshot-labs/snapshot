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
    proposal: Object
  },
  computed: {
    state() {
      const ts = (Date.now() / 1e3).toFixed();
      const { start, end } = this.proposal.msg.payload;
      if (ts > end) return { name: 'Closed', class: 'bg-purple' };
      if (ts > start) return { name: 'Active', class: 'bg-green' };
      return { name: 'Pending' };
    }
  }
};
</script>
