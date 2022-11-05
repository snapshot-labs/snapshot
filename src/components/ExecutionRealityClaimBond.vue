<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

defineProps<{
  assignBondBalancesAndWithdraw(): Promise<void>;
  withdrawBondBalance(): Promise<void>;
  withdrawableUserBondBalance: BigNumber;
  bondSymbol: string;
  bondDecimals: number;
  allBondsAssigned: boolean;
  currentUserVotedForCorrectAnswer: boolean;
}>();
</script>

<template>
  <BaseButton
    v-if="currentUserVotedForCorrectAnswer && !allBondsAssigned"
    @click="assignBondBalancesAndWithdraw"
  >
    Withdraw bond
  </BaseButton>
  <BaseButton
    v-else-if="withdrawableUserBondBalance.gt(0)"
    @click="withdrawBondBalance"
  >
    Withdraw {{ formatUnits(withdrawableUserBondBalance, bondDecimals) }}
    {{ bondSymbol }}
  </BaseButton>
</template>
