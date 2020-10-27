<template>
  <Block :title="ts >= payload.end ? 'Results' : 'Current results'">
    <div v-for="(choice, i) in payload.choices" :key="i">
      <div class="text-white mb-1">
        <span v-text="_shorten(choice, 'choice')" class="mr-1" />
        <span
          class="mr-1 tooltipped tooltipped-n"
          :aria-label="
            results.totalScores[i]
              .map((score, index) => `${_numeral(score)} ${titles[index]}`)
              .join(' + ')
          "
        >
          {{ _numeral(results.totalBalances[i]) }}
          {{ _shorten(space.symbol, 'symbol') }}
        </span>
        <span
          class="float-right"
          v-text="
            $n(
              !results.totalVotesBalances
                ? 0
                : ((100 / results.totalVotesBalances) *
                    results.totalBalances[i]) /
                    1e2,
              'percent'
            )
          "
        />
      </div>
      <UiProgress
        :value="results.totalScores[i]"
        :max="results.totalVotesBalances"
        :titles="titles"
        class="mb-3"
      />
    </div>
    <div v-if="ts >= payload.end">
      <UiButton
        v-if="
          _get(payload, 'metadata.plugins.aragon') &&
            _get(space, 'plugins.aragon')
        "
        @click="executePlugin('aragon')"
        :loading="loading"
        class="width-full mt-2 button--submit"
      >
        Submit on-chain
      </UiButton>
      <UiButton v-else @click="downloadReport" class="width-full mt-2">
        Download report
      </UiButton>
    </div>
  </Block>
</template>

<script>
import { mapActions } from 'vuex';
import * as jsonexport from 'jsonexport/dist';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import pkg from '@/../package.json';

export default {
  props: ['id', 'space', 'payload', 'results', 'votes'],
  data() {
    return {
      loading: false
    };
  },
  computed: {
    ts() {
      return (Date.now() / 1e3).toFixed();
    },
    titles() {
      return this.space.strategies.map(strategy => strategy.params.symbol);
    },
    winningChoice() {
      let winningChoice = 0;
      let winningScore = 0;
      this.results.totalScores.forEach((score, i) => {
        if (score[0] > winningScore) {
          winningChoice = i + 1;
          winningScore = score[0];
        }
      });
      return winningChoice;
    }
  },
  methods: {
    ...mapActions(['notify']),
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
    },
    async executePlugin(plugin) {
      if (!this.space.plugins || !this.space.plugins[plugin]) return;
      this.loading = true;
      const aragon = new plugins[plugin]();
      try {
        const result = await aragon.execute(
          this.$auth.web3,
          this.space.plugins[plugin],
          this.payload.metadata.plugins[plugin],
          this.id,
          this.winningChoice
        );
        console.log('Result', result);
        this.notify(['green', `The settlement is on-chain, congrats!`]);
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    }
  }
};
</script>
