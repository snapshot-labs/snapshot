<script>
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Plugin from '../index';
import { shorten } from '@/helpers/utils';
import { useIntl, useQuorum } from '@/composables';

const { formatCompactNumber, formatPercentNumber } = useIntl();
const { quorumScore } = useQuorum();

export default {
  props: ['space', 'proposal', 'results', 'loaded', 'strategies', 'votes'],
  setup() {
    return { shorten, formatCompactNumber, formatPercentNumber };
  },
  data() {
    return {
      loading: false,
      plugin: new Plugin(),
      totalVotingPower: 0
    };
  },
  computed: {
    totalScore() {
      const basicCount = this.space.plugins?.quorum?.basicCount;
      const votes =
        basicCount && this.proposal.type === 'basic'
          ? this.votes.filter(vote => basicCount.includes(vote.choice - 1))
          : this.votes;
      return quorumScore({
        proposal: this.proposal,
        results: this.results,
        votes
      });
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
  <BaseBlock title="Quorum" :loading="!loaded">
    <div class="mb-1 text-skin-link">
      <span class="mr-1">
        {{ formatCompactNumber(totalScore) }} /
        {{ formatCompactNumber(totalVotingPower) }}
        {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
      </span>
      <span class="float-right" v-text="formatPercentNumber(quorum)" />
    </div>
    <ProposalResultsProgressBar :value="quorum" :max="1" class="mb-3" />
  </BaseBlock>
</template>
