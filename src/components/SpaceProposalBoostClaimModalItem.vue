<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const props = defineProps<{
  boost: BoostSubgraph;
  rewards: BoostRewardGuard[];
  claims: BoostClaimSubgraph[];
  loading?: { [key: string]: string };
}>();

defineEmits(['claim']);

const { formatNumber, getNumberFormatter } = useIntl();

const reward = computed(() => {
  const reward = props.rewards.find(
    reward => reward.boost_id === props.boost.id
  ) as BoostRewardGuard;
  if (!reward) return '0';
  const amountDecimal = formatUnits(
    reward.reward.toString(),
    props.boost.token.decimals
  );

  return formatNumber(
    Number(amountDecimal),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const hasClaimed = computed(() => {
  return props.claims.some(
    claim =>
      claim.boost.id === props.boost.id && claim.chainId === props.boost.chainId
  );
});

const claimLoading = computed(() => {
  return props.loading?.[props.boost.id] === props.boost.chainId;
});

const isLottery = computed(() => {
  return props.boost.strategy.distribution.type === 'lottery';
});
</script>

<template>
  <div
    class="flex items-center justify-between border rounded-xl p-[12px] h-[58px]"
    :class="{
      'border-green/30 bg-green/5': hasClaimed,
      'border-boost/30 bg-boost/5': !hasClaimed && Number(reward) > 0
    }"
  >
    <div class="text-skin-heading flex items-center">
      <div
        class="border rounded-full p-[3px] mr-2"
        :class="{
          'border-green/40 bg-green/10': hasClaimed,
          'border-boost/40 bg-boost/10': !hasClaimed && Number(reward) > 0
        }"
      >
        <i-ho-cash v-if="hasClaimed" class="text-green text-xs" />
        <i-ho-gift v-else class="text-boost text-xs" />
      </div>
      <span v-if="isLottery" class="mr-1">
        {{ hasClaimed ? 'Claimed' : 'You won' }}
      </span>
      <span v-else class="mr-1">
        {{ hasClaimed ? 'Claimed' : 'Eligible to' }}
      </span>
      <TuneTag class="text-skin-heading text-base">
        {{ reward }} {{ props.boost.token.symbol }}
      </TuneTag>
    </div>

    <TuneButton
      v-if="!hasClaimed && Number(reward) > 0"
      class="h-[32px] px-[12px] bg-skin-bg"
      :loading="claimLoading"
      @click="$emit('claim', boost)"
    >
      Claim
    </TuneButton>
  </div>
</template>
