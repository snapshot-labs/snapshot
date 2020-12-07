<template>
  <Block title="Quorum">
    <div>
      <div class="text-white mb-1">
        <span class="mr-1 tooltipped tooltipped-n">
          Quorum result
        </span>
        <span class="float-right" v-text="$n(this.percents, 'percent')" />
      </div>
      <UiProgress :value="values" :max="maxValues" class="mb-3" />
    </div>
  </Block>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Quorum',
  props: ['id', 'space', 'payload', 'results', 'proposal', 'votes'],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    totalSupply() {
      return this.proposal.totalSupply;
    },
    quorum() {
      return this.payload.quorum;
    },
    percents() {
      const { decimals } = this.space.strategies[0].params;
      const totalSupply = Number(this.totalSupply) / decimals;

      if (totalSupply === 0) {
        return 0;
      }

      return (
        this.results.totalVotesBalances / ((this.quorum / 100) * totalSupply)
      );
    },
    maxValues() {
      const { decimals } = this.space.strategies[0].params;
      const totalSupply = Number(this.totalSupply) / decimals;

      return (this.quorum / 100) * totalSupply;
    },
    values() {
      return this.results.totalVotesBalances;
    }
  },
  methods: {
    ...mapActions(['notify'])
  }
};
</script>
