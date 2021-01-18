<template>
  <span :class="state.class" v-text="state.name" class="State text-normal" />
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
