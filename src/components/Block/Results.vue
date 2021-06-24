<template>
  <Block
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <div v-for="choice in choices" :key="choice.i">
      <div class="text-white mb-1">
        <span
          class="mr-1 tooltipped"
          :class="[
            isSmallScreen
              ? 'tooltipped-ne tooltipped-align-left-2'
              : 'tooltipped-n'
          ]"
          :aria-label="choice.choice.length > 12 && choice.choice"
          v-text="_shorten(choice.choice, 'choice')"
        />
        <span
          class="mr-1 tooltipped tooltipped-multiline tooltipped-n"
          :aria-label="
            results.resultsByStrategyScore[choice.i]
              .map((score, index) => `${_n(score)} ${titles[index]}`)
              .join(' + ')
          "
        >
          {{ _n(results.resultsByVoteBalance[choice.i]) }}
          {{ _shorten(space.symbol, 'symbol') }}
        </span>
        <span
          class="float-right"
          v-text="
            _n(
              !results.sumOfResultsBalance
                ? 0
                : ((100 / results.sumOfResultsBalance) *
                    results.resultsByVoteBalance[choice.i]) /
                    1e2,
              '0.[00]%'
            )
          "
        />
      </div>
      <UiProgress
        :value="results.resultsByStrategyScore[choice.i]"
        :max="results.sumOfResultsBalance"
        :titles="titles"
        class="mb-3"
      />
    </div>
    <div v-if="ts >= proposal.end">
      <UiButton @click="downloadReport" class="width-full mt-2">
        {{ $t('downloadReport') }}
      </UiButton>
    </div>
  </Block>
</template>

<script>
import * as jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';
import { useMediaQuery } from '@/composables/useMediaQuery';

export default {
  props: [
    'id',
    'space',
    'proposal',
    'results',
    'votes',
    'loaded',
    'strategies'
  ],
  setup() {
    const { isSmallScreen } = useMediaQuery();
    return { isSmallScreen };
  },
  computed: {
    ts() {
      return (Date.now() / 1e3).toFixed();
    },
    titles() {
      return this.strategies.map(strategy => strategy.params.symbol);
    },
    choices() {
      return this.proposal.choices
        .map((choice, i) => ({ i, choice }))
        .sort(
          (a, b) =>
            this.results.resultsByVoteBalance[b.i] -
            this.results.resultsByVoteBalance[a.i]
        );
    }
  },
  methods: {
    async downloadReport() {
      const obj = this.votes
        .map(vote => {
          return {
            address: vote.voter,
            choice: vote.choice,
            balance: vote.balance,
            timestamp: vote.created,
            dateUtc: new Date(parseInt(vote.created) * 1e3).toUTCString(),
            authorIpfsHash: vote.id
            // relayerIpfsHash: vote[1].relayerIpfsHash
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp, 0);
      try {
        const csv = await jsonexport(obj);
        const link = document.createElement('a');
        link.setAttribute('href', `data:text/csv;charset=utf-8,${csv}`);
        link.setAttribute('download', `${pkg.name}-report-${this.id}.csv`);
        document.body.appendChild(link);
        link.click();
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>
