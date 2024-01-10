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
    class="border rounded-xl p-[12px] flex justify-between"
    :class="[
      { 'border-snapshot/40 bg-snapshot/5': isEligible && !isClaimedByUser },
      { 'border-green/40 bg-green/5': isClaimedByUser }
    ]"
  >
    <div class="pr-4">
      <div class="text-skin-heading">
        <template v-if="boost.strategy.params.eligibility?.choice !== null">
          Who votes
          <TuneTag
            :label="proposal.choices[boost.strategy.params.eligibility.choice]"
            class="text-skin-heading"
          />
        </template>
        <template v-else> Voters </template>
        share a pool of
        <TuneTag
          :label="`${boostBalanceFormatted} ${boost.token.symbol}`"
          class="text-skin-heading"
        />
        <template
          v-if="boost.strategy.params.distribution?.type === 'weighted'"
        >
          based on
          <TuneTag label="Voting power" class="text-skin-heading" />
        </template>
      </div>
      <div class="flex items-center mt-1">
        <i-ho-lock-closed class="mr-1 text-xs" />
        Secured by Snapshot
      </div>
    </div>

    <div
      v-if="isClaimedByUser"
      v-tippy="{ content: `Claimed ${claimedAmount} ${boost.token.symbol}` }"
      class="border rounded-full h-[25px] w-[25px] p-[3px] bg-green/10 border-green/40 hover:cursor-help"
    >
      <i-ho-currency-dollar class="text-xs text-green" />
    </div>
    <div
      v-else-if="isEligible"
      v-tippy="{ content: 'You are eligible for this boost' }"
      class="border rounded-full h-[25px] w-[25px] p-[3px] border-snapshot/40 bg-snapshot/10 hover:cursor-help"
    >
      <i-ho-fire class="text-xs text-snapshot" />
    </div>
  </div>
</template>
