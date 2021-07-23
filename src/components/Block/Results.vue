<script setup>
import { computed, defineProps } from 'vue';
import * as jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';
import { useMediaQuery } from '@/composables/useMediaQuery';

const props = defineProps({
  id: String,
  space: Object,
  proposal: Object,
  results: Object,
  votes: Object,
  loaded: Boolean,
  strategies: Object
});

const ts = (Date.now() / 1e3).toFixed();

const { isSmallScreen } = useMediaQuery();

const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol)
);
const choices = computed(() =>
  props.proposal.choices
    .map((choice, i) => ({ i, choice }))
    .sort(
      (a, b) =>
        props.results.resultsByVoteBalance[b.i] -
        props.results.resultsByVoteBalance[a.i]
    )
);

async function downloadReport() {
  const obj = props.votes
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
    link.setAttribute('download', `${pkg.name}-report-${props.id}.csv`);
    document.body.appendChild(link);
    link.click();
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <Block
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <div v-for="choice in choices" :key="choice.i">
      <div class="link-color mb-1">
        <span
          class="mr-1"
          :class="[
            choice.choice.length > 12 &&
              (isSmallScreen
                ? 'tooltipped tooltipped-ne tooltipped-align-left-2'
                : 'tooltipped tooltipped-n')
          ]"
          :aria-label="choice.choice"
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
