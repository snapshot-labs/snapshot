<template>
  <Block
    v-if="quorum > 0 && !isZWAP"
    title="Quorum"
  >
    <div>
      <div class="text-white mb-1">
        <span class="mr-1 tooltipped tooltipped-n">
          % of quorum achieved
        </span>
        <span class="float-right" v-text="Math.round(this.percents) + '%'" />
      </div>
      <UiProgress :value="values" :max="maxValues" class="mb-3" />
    </div>
  </Block>
</template>

<script>
import { mapActions } from 'vuex';
import Big from 'big.js';

Big.PE = 99;
const _100 = Big(100);

export default {
  name: 'Quorum',
  props: ['id', 'space', 'payload', 'results', 'proposal', 'votes'],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    isZWAP() {
      return this.proposal.msg.token === 'zil1p5suryq6q647usxczale29cu3336hhp376c627'
    },
    totalSupply() {
      return this.proposal.totalSupply;
    },
    quorum() {
      return this.payload.quorum;
    },
    percents() {
      if (this.quorum <= 0) {
        return 0;
      }

      const { decimals } = this.space.strategies[0].params;
      const _amounts = Big(this.results.totalVotesBalances);
      const _totalSupply = Big(this.totalSupply)
        .div(Big(10 ** decimals))
        .round();

      if (Number(_totalSupply) === 0) {
        return 0;
      }

      const _quorum = Big(this.quorum / 100);
      const _b = _totalSupply.mul(_quorum);
      const _result = _amounts.div(_b).mul(_100);

      return _result.toString();
    },
    maxValues() {
      const { decimals } = this.space.strategies[0].params;
      const _decimals = Big(10 ** decimals);
      const _totalSupply = Big(this.totalSupply).div(_decimals);
      const _quorum = Big(this.quorum).div(_100);
      const _value = _quorum.mul(_totalSupply);

      return Number(_value.round());
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
