<template>
  <Block title="Quorum">
    <div class="text-white mb-1">
      <span class="mr-1">
        {{ _n(totalScore) }} / {{ _n(totalVotingPower) }}
        {{ _shorten(space.symbol, 'symbol') }}
      </span>
      <span class="float-right" v-text="$n(quorum, 'percent')" />
    </div>
    <UiProgress :value="quorum" :max="1" class="mb-3" />
  </Block>
</template>

<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/quorum';

export default {
  props: ['space', 'payload', 'results'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      quorum: 0.0
    };
  },
  computed: {
    titles() {
      return this.space.strategies.map(strategy => strategy.params.symbol);
    },
    totalScore() {
      return this.results.totalScores.reduce((res, score) => res + score[0], 0);
    }
  },

  async created() {
    this.loading = true;

    this.totalVotingPower = await this.plugin.getTotalVotingPower(
      getProvider(this.space.network),
      this.space.plugins.quorum,
      this.payload.snapshot
    );

    this.quorum =
      this.totalVotingPower === 0 ? 0 : this.totalScore / this.totalVotingPower;

    this.loading = false;
  }
};
</script>
