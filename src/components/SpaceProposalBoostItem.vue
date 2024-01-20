<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';

const props = defineProps<{
  proposal: Proposal;
  boost: BoostSubgraphResult;
  claims: { id: string; amount: string }[];
  web3Account: string;
  isEligible: boolean;
}>();

const { formatNumber, getNumberFormatter } = useIntl();

const boostBalanceFormatted = computed(() => {
  const formattedUnits = formatUnits(
    props.boost.poolSize,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 16 }).value
  );
});

const isClaimedByUser = computed(() => {
  if (!props.web3Account) return false;
  // Need to split because the id is in the format: boostId.address
  const claims = props.claims.map(claim => claim.id.split('.'));

  return claims.some(
    claim =>
      BigNumber.from(claim[0]).toString() === props.boost.id &&
      getAddress(claim[1]) === getAddress(props.web3Account)
  );
});

const claimedAmount = computed(() => {
  // Need to split because the id is in the format: boostId.address
  const claim = props.claims.find(
    claim =>
      BigNumber.from(claim.id.split('.')[0]).toString() === props.boost.id
  );

  if (!claim) return '0';

  const formattedUnits = formatUnits(claim.amount, props.boost.token.decimals);

  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 16 }).value
  );
});
</script>

<template>
  <div
    class="border rounded-xl p-[12px] flex justify-between relative"
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
        <span class="hidden md:block px-2 text-lg leading-none">·</span>
        <div v-if="isClaimedByUser" class="flex items-center gap-1">
          <i-ho-cash class="text-xs" />
          Claimed {{ claimedAmount }} {{ boost.token.symbol }}
        </div>
        <div v-else-if="isEligible" class="flex items-center gap-1">
          <i-ho-fire class="text-xs" />
          Eligible to reward
        </div>
      </div>
    </div>
    <SpaceProposalBoostItemMenu :boost="boost" />
  </div>
</template>
