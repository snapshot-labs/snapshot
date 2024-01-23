<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const props = defineProps<{
  proposal: Proposal;
  boost: BoostSubgraph;
  claims?: BoostClaimSubgraph[];
  web3Account: string;
  isEligible?: boolean;
  reward?: BoostRewardGuard;
}>();

const { formatNumber, getNumberFormatter } = useIntl();

const boostBalanceFormatted = computed(() => {
  const formattedUnits = formatUnits(
    props.boost.poolSize,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const isClaimedByUser = computed(() => {
  if (!props.claims?.length) return false;

  return props.claims.some(claim => claim.boost.id === props.boost.id);
});

const claimedAmount = computed(() => {
  if (!props.claims?.length) return '0';
  const claim = props.claims.find(claim => claim.boost.id === props.boost.id);

  if (!claim) return '0';

  const formattedUnits = formatUnits(claim.amount, props.boost.token.decimals);

  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const rewardFormatted = computed(() => {
  if (!props.reward) return '0';
  const formattedUnits = formatUnits(
    props.reward.reward,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});
</script>

<template>
  <div
    class="border border-[--border-color-soft] rounded-xl p-[12px] flex justify-between relative"
    :class="[
      { 'border-snapshot/40 bg-snapshot/5': isEligible && !isClaimedByUser },
      { 'border-green/30 bg-green/5': isClaimedByUser }
    ]"
  >
    <div class="pr-5">
      <div class="text-skin-heading flex flex-wrap -mt-1">
        <div class="whitespace-nowrap mt-1 mr-1">
          <template v-if="boost.strategy.eligibility.choice !== null">
            Who votes
            <TuneTag
              :label="proposal.choices[boost.strategy.eligibility.choice - 1]"
              class="text-skin-heading"
            />
          </template>
          <template v-else> Voters </template>
        </div>
        <div class="whitespace-nowrap mt-1 mr-1">
          share a pool of
          <TuneTag
            :label="`${boostBalanceFormatted} ${boost.token.symbol}`"
            class="text-skin-heading"
          />
        </div>
        <div class="whitespace-nowrap mt-1">
          <template v-if="boost.strategy.distribution.type === 'weighted'">
            based on
            <TuneTag label="Voting power" class="text-skin-heading" />
          </template>
        </div>
      </div>
      <div class="mt-2 md:flex">
        <div class="flex items-center gap-1 mb-[2px]">
          <i-ho-lock-closed class="text-xs" />
          Secured by Snapshot
        </div>
        <span
          v-if="isClaimedByUser || isEligible"
          class="hidden md:block px-2 text-lg leading-none"
          >·</span
        >
        <div v-if="isClaimedByUser" class="flex items-center gap-1">
          <i-ho-cash class="text-xs" />
          Claimed {{ claimedAmount }} {{ boost.token.symbol }}
        </div>
        <div v-else-if="isEligible" class="flex items-center gap-1">
          <i-ho-fire class="text-xs" />
          Eligible to
          {{ reward ? `${rewardFormatted} ${boost.token.symbol}` : 'reward' }}
        </div>
      </div>
    </div>
    <SpaceProposalBoostItemMenu :boost="boost" />
  </div>
</template>
