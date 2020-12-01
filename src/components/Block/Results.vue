<template>
  <Block :title="ts >= payload.end ? 'Results' : 'Current results'">
    <div v-for="choice in choices" :key="choice.i">
      <div class="text-white mb-1">
        <span v-text="_shorten(choice.choice, 'choice')" class="mr-1" />
        <span
          class="mr-1 tooltipped tooltipped-n"
          :aria-label="
            results.totalScores[choice.i]
              .map((score, index) => `${_numeral(score)} ${titles[index]}`)
              .join(' + ')
          "
        >
          {{ _numeral(results.totalBalances[choice.i]) }}
          {{ _shorten(space.symbol, 'symbol') }}
        </span>
        <span
          class="float-right"
          v-text="
            $n(
              !results.totalVotesBalances
                ? 0
                : ((100 / results.totalVotesBalances) *
                    results.totalBalances[choice.i]) /
                    1e2,
              'percent'
            )
          "
        />
      </div>
      <UiProgress
        :value="results.totalScores[choice.i]"
        :max="results.totalVotesBalances"
        :titles="titles"
        class="mb-3"
      />
    </div>
    <div v-if="ts >= payload.end">
      <UiButton @click="downloadReport" class="width-full mt-2">
        Download report
      </UiButton>
    </div>
  </Block>
</template>

<script>
import * as jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';

export default {
  props: ['id', 'space', 'payload', 'results', 'votes'],
  computed: {
    ts() {
      return (Date.now() / 1e3).toFixed();
    },
    titles() {
      return this.space.strategies.map(strategy => strategy.params.symbol);
    },
    choices() {
      return this.payload.choices
        .map((choice, i) => ({ i, choice }))
        .sort(
          (a, b) =>
            this.results.totalBalances[b.i] - this.results.totalBalances[a.i]
        );
    }
  },
  methods: {
    async downloadReport() {
      const obj = Object.entries(this.votes)
        .map(vote => {
          return {
            address: vote[0],
            choice: vote[1].msg.payload.choice,
            balance: vote[1].balance,
            timestamp: vote[1].msg.timestamp,
            dateUtc: new Date(
              parseInt(vote[1].msg.timestamp) * 1e3
            ).toUTCString(),
            authorIpfsHash: vote[1].authorIpfsHash,
            relayerIpfsHash: vote[1].relayerIpfsHash
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
