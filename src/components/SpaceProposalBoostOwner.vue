<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { withdrawAndBurn } from '@/helpers/boost';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { BoostSubgraph } from '@/helpers/boost/types';

defineProps<{
  boosts: BoostSubgraph[];
  proposal: Proposal;
}>();

const emit = defineEmits(['reload']);

const auth = getInstance();
const { formatNumber, getNumberFormatter, formatDuration } = useIntl();
const { web3Account } = useWeb3();

function claimPeriodEnded(boost: BoostSubgraph) {
  return Number(boost.end) < Date.now() / 1000;
}

function withdrawalAmount(boost: BoostSubgraph) {
  const formattedUnits = formatUnits(
    boost.currentBalance,
    boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
}

async function withdraw(boost: BoostSubgraph) {
  try {
    const tx = await withdrawAndBurn(
      auth.web3,
      boost.chainId,
      boost.id,
      web3Account.value
    );
    await tx.wait();
    emit('reload');
  } catch (e) {
    console.error('Error withdrawing boost', e);
  }
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
            class="sm:flex justify-between items-center"
          >
            <div class="leading-none">
              <div class="font-semibold text-skin-heading">Withdraw</div>
              <div>
                You have {{ withdrawalAmount(boost) }}
                {{ boost.token.symbol }} to withdraw
              </div>
            </div>

            <TuneButton
              v-if="Number(withdrawalAmount(boost)) > 0"
              class="h-5 px-[12px] text-skin-link bg-skin-bg w-full sm:w-auto mt-2 sm:mt-0"
              @click="withdraw(boost)"
            >
              Withdraw {{ withdrawalAmount(boost) }} {{ boost.token.symbol }}
            </TuneButton>
          </div>
          <div v-else class="md:flex">
            <div>
              Remaining amount:
              <span class="text-skin-heading">
                {{ withdrawalAmount(boost) }} {{ boost.token.symbol }}
              </span>
            </div>
            <span class="hidden md:block px-2 text-lg leading-none">·</span>
            <div class="mt-[2px] md:mt-0">
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
