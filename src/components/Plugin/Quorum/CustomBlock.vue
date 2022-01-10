<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Plugin from '@/../snapshot-plugins/src/plugins/quorum';
import { shorten } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';

const { formattedCompactNumber, formattedPercentNumber } = useIntl();

export default {
  setup() {
    return { shorten, formattedCompactNumber, formattedPercentNumber };
  },
  props: ['space', 'proposal', 'results', 'loaded', 'strategies'],
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      totalVotingPower: 0
    };
  },
  computed: {
    totalScore() {
      return this.results.resultsByVoteBalance.reduce((a, b) => a + b, 0);
    },
    quorum() {
      return this.totalVotingPower === 0
        ? 0
        : this.totalScore / this.totalVotingPower;
    }
  },

  async created() {
    this.loading = true;

    this.totalVotingPower = await this.plugin.getTotalVotingPower(
      getProvider(this.space.network),
      this.space.plugins.quorum,
      this.proposal.snapshot
    );

    this.loading = false;
  }
};
</script>

<template>
  <Block title="Quorum" :loading="!loaded">
    <div class="link-color mb-1">
      <span class="mr-1">
        {{ formattedCompactNumber(totalScore) }} / {{ formattedCompactNumber(totalVotingPower) }}
        {{ shorten(space.symbol, 'symbol') }}
      </span>
      <span class="float-right" v-text="formattedPercentNumber(quorum)" />
    </div>
    <UiProgress :value="quorum" :max="1" class="mb-3" />
  </Block>
</template>
