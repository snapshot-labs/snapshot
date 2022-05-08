<script setup>
import { computed } from 'vue';
import { shorten } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';

const { formatCompactNumber, formatPercentNumber } = useIntl();

const props = defineProps({
  id: String,
  space: Object,
  proposal: Object,
  results: Object,
  votes: Object,
  loaded: Boolean,
  strategies: Object
});

const titles = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
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

const getPercentage = (n, max) => (max ? ((100 / max) * n) / 1e2 : 0);
const hideAbstain = props.space?.voting?.hideAbstain ?? false;
const ts = (Date.now() / 1e3).toFixed();
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <div class="space-y-3">
      <div v-for="choice in choices" :key="choice.i">
        <template
          v-if="!(proposal.type === 'basic' && hideAbstain && choice.i === 2)"
        >
          <div class="text-skin-link mb-1 flex justify-between">
            <div class="flex overflow-hidden">
              <span
                v-tippy="{
                  content: choice.choice
                }"
                class="mr-1 truncate"
                v-text="choice.choice"
              />
            </div>
            <template class="flex justify-end space-x-2">
              <span
                class="whitespace-nowrap"
                v-tippy="{
                  content: results.resultsByStrategyScore[choice.i]
                    .map(
                      (score, index) =>
                        `${formatCompactNumber(score)} ${titles[index]}`
                    )
                    .join(' + ')
                }"
              >
                {{
                  formatCompactNumber(results.resultsByVoteBalance[choice.i])
                }}
                {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
              </span>
              <span
                v-if="
                  proposal.type === 'basic' && hideAbstain && choice.i === 0
                "
                v-text="
                  formatPercentNumber(
                    getPercentage(
                      results.resultsByVoteBalance[0],
                      results.resultsByVoteBalance[0] +
                        results.resultsByVoteBalance[1]
                    )
                  )
                "
              />
              <span
                v-else-if="
                  proposal.type === 'basic' && hideAbstain && choice.i === 1
                "
                v-text="
                  formatPercentNumber(
                    getPercentage(
                      results.resultsByVoteBalance[1],
                      results.resultsByVoteBalance[0] +
                        results.resultsByVoteBalance[1]
                    )
                  )
                "
              />
              <span
                v-else
                v-text="
                  formatPercentNumber(
                    getPercentage(
                      results.resultsByVoteBalance[choice.i],
                      results.sumOfResultsBalance
                    )
                  )
                "
              />
            </template>
          </div>

          <ProposalResultsProgressBar
            :value="results.resultsByStrategyScore[choice.i]"
            :max="
              proposal.type === 'basic' && hideAbstain
                ? results.resultsByVoteBalance[0] +
                  results.resultsByVoteBalance[1]
                : results.sumOfResultsBalance
            "
          />
        </template>
      </div>
      <div
        v-if="proposal.quorum || space.voting?.quorum"
        class="text-skin-link"
      >
        {{ $t('settings.quorum') }}
        <span class="float-right">
          {{ formatCompactNumber(results.sumOfResultsBalance) }} /
          {{ formatCompactNumber(proposal.quorum || space.voting.quorum) }}
        </span>
      </div>
    </div>
  </BaseBlock>
</template>
