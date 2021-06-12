<template>
  <Block title="Quorum" :loading="!loaded">
    <div class="text-white mb-1">
      <span class="mr-1">
        {{ _n(totalScore) }} / {{ _n(resultsByChoices) }}
        {{ _shorten(space.symbol, 'symbol') }}
      </span>
      <span class="float-right" v-text="_n(quorum, '0.[00]%')" />
    </div>
    <UiProgress :value="quorum" :max="1" class="mb-3" />
  </Block>
</template>

<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/quorum';

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      resultsByChoices: 0
    };
  },
  computed: {
    totalScore() {
      return this.results.resultsByChoices.reduce((a, b) => a + b, 0);
    },
    quorum() {
      return this.resultsByChoices === 0
        ? 0
        : this.totalScore / this.resultsByChoices;
    }
  },

  async created() {
    this.loading = true;

    this.resultsByChoices = await this.plugin.getresultsByChoices(
      getProvider(this.space.network),
      this.space.plugins.quorum,
      this.proposal.snapshot
    );

    this.loading = false;
  }
};
</script>
