<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';

defineProps<{
  boosts: BoostSubgraphResult[];
  proposal: Proposal;
}>();

const { formatNumber, getNumberFormatter, formatDuration } = useIntl();
const { web3Account } = useWeb3();

function claimPeriodEnded(boost: BoostSubgraphResult) {
  return Number(boost.end) < Date.now() / 1000;
}

function withdrawalAmount(boost: BoostSubgraphResult) {
  const formattedUnits = formatUnits(
    boost.currentBalance,
    boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 16 }).value
  );
}
</script>

<template>
  <div class="bg-[--border-color-subtle] rounded-t-2xl rounded-b-xl">
    <div class="px-[12px] py-2">Your boosts</div>
    <div
      v-for="boost in boosts"
      :key="boost.id"
      class="border border-[--border-color-soft] rounded-xl first:mt-0 -mt-[1px]"
    >
      <SpaceProposalBoostItem
        :boost="boost"
        :proposal="proposal"
        :web3-account="web3Account"
        class="bg-skin-bg border-none rounded-b-none"
      />
      <div class="bg-skin-bg rounded-b-xl">
        <div
          class="bg-[--border-color-faint] p-[12px] border-t rounded-b-xl border-[--border-color-soft]"
        >
          <div
            v-if="claimPeriodEnded(boost)"
            class="flex justify-between items-center"
          >
            <div class="leading-none">
              <div class="font-semibold text-skin-heading">Withdraw</div>
              <div>
                You have {{ withdrawalAmount(boost) }} {{ boost.token.symbol }}
              </div>
            </div>

            <TuneButton class="h-5 px-[12px] text-skin-link bg-skin-bg">
              Withdraw {{ withdrawalAmount(boost) }} {{ boost.token.symbol }}
            </TuneButton>
          </div>
          <div v-else class="flex">
            <div>
              Remaining amount:
              <span class="text-skin-heading">
                {{ withdrawalAmount(boost) }} {{ boost.token.symbol }}
              </span>
            </div>
            <span class="hidden md:block px-2 text-lg leading-none">·</span>
            <div>
              Withdrawable in:
              <span class="text-skin-heading">
                {{ formatDuration(Number(boost.end) - Number(boost.start)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
