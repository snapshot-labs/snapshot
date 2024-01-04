<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';

const props = defineProps<{
  proposal: Proposal;
  boost: BoostSubgraphResult;
  isEligible: boolean;
}>();

const { formatNumber, getNumberFormatter } = useIntl();

const boostBalanceFormatted = computed(() => {
  const formattedUnits = formatUnits(
    props.boost.balance,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 6 }).value
  );
});
</script>

<template>
  <div
    class="border rounded-xl p-[12px] flex justify-between"
    :class="{ '!border-snapshot/40 bg-snapshot/5': isEligible }"
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
      v-if="isEligible"
      v-tippy="{ content: 'You are eligible for this boost' }"
      class="border rounded-full h-[25px] w-[25px] p-[3px] !border-snapshot/40 bg-snapshot/10 hover:cursor-help"
    >
      <i-ho-fire class="text-xs text-snapshot" />
    </div>
  </div>
</template>
