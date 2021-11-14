<script setup>
import { computed } from 'vue';

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
</script>

<template>
  <Block
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <div v-for="choice in choices" :key="choice.i">
      <div class="link-color mb-1">
        <span
          v-tippy="{
            content: choice.choice.length > 12 ? choice.choice : null
          }"
          class="mr-1"
          v-text="_shorten(choice.choice, 'choice')"
        />

        <span
          class="inline-block"
          v-tippy="{
            content: results.resultsByStrategyScore[choice.i]
              .map((score, index) => `${_n(score)} ${titles[index]}`)
              .join(' + ')
          }"
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
    <div v-if="props.space?.voting?.quorum" class="text-skin-link">
      {{ $t('settings.quorum') }}
      <span class="float-right">
        {{ _n(results.sumOfResultsBalance) }} /
        {{ _n(props.space.voting.quorum) }}
      </span>
    </div>
  </Block>
</template>
