<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Plugin from '../index';
import { shorten } from '@/helpers/utils';
import {
  ExtendedSpace,
  Proposal,
  Vote,
  SpaceStrategy
} from '@/helpers/interfaces';

import { useIntl, useQuorum } from '@/composables';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: any;
  loaded: any;
  strategies: SpaceStrategy[];
  votes: Vote[];
}>();

const { formatCompactNumber, formatPercentNumber } = useIntl();
const { quorumScore } = useQuorum();

const loading = ref(false);
const plugin = ref(new Plugin());
const totalVotingPower = ref(0);

const totalScore = computed(() => {
  const basicCount = props.space.plugins?.quorum?.basicCount;
  if (basicCount && props.proposal.type === 'basic')
    return props.votes
      .filter(vote => basicCount.includes((vote.choice as number) - 1))
      .reduce((a, b) => a + b.balance, 0);

  return quorumScore({
    proposal: props.proposal,
    results: props.results,
    votes: props.votes
  });
});

const quorum = computed(() => {
  return totalVotingPower.value === 0
    ? 0
    : Number(totalScore.value) / totalVotingPower.value;
});

onMounted(async () => {
  loading.value = true;

  totalVotingPower.value = await plugin.value.getTotalVotingPower(
    getProvider(props.space.network),
    props.space.plugins.quorum,
    props.proposal.snapshot
  );

  loading.value = false;
});
</script>

<template>
  <BaseBlock title="Quorum" :loading="!loaded">
    <div class="mb-1 text-skin-link">
      <span class="mr-1">
        {{ formatCompactNumber(Number(totalScore)) }} /
        {{ formatCompactNumber(totalVotingPower) }}
        {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
      </span>
      <span class="float-right" v-text="formatPercentNumber(quorum)" />
    </div>
    <ProposalResultsProgressBar :value="quorum" :max="1" class="mb-3" />
  </BaseBlock>
</template>
