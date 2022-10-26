<script setup lang="ts">
import { computed } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { Proposal } from '@/helpers/interfaces';
import { ModuleExecutionData } from '@/helpers/safe';
import { useExecutorUma } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  executionDataIndex: number;
  proposal: Proposal;
}>();

const {
  loading,
  executionState,
  propose,
  dispute,
  execute,
  now,
  bondBalance,
  bondAllowance,
  bondAmount,
  bondDecimals,
  bondSymbol,
  approveBond,
  proposedAt,
  disputeTimeout
} = await useExecutorUma(
  props.executionDataIndex,
  props.executionData,
  props.proposal
);

const hasBondAllowance = computed<boolean>(() =>
  bondAllowance.value.gte(bondAmount)
);
const hasBondBalance = computed<boolean>(() =>
  bondBalance.value.gte(bondAmount)
);
</script>

<template>
  <ExecutionAbstract
    :loading="loading"
    :execution-state="executionState"
    :network="executionData.safe.network"
  >
    <template #propose>
      <div v-if="hasBondAllowance" class="flex flex-col">
        <template v-if="hasBondBalance">
          <BaseButton @click="propose"> propose transactions </BaseButton>
          <small class="mt-2 opacity-50">
            You will deposit a bond of
            {{ formatUnits(bondAmount, bondDecimals) }}.
          </small>
        </template>
        <template v-else>
          You don't have the required
          {{ formatUnits(bondAmount, bondDecimals) }} {{ bondSymbol }} to
          propose.
        </template>
      </div>
      <div v-else>
        To propose transactions you need to deposit a bond of
        {{ formatUnits(bondAmount, bondDecimals) }}
        {{ bondSymbol }}.<br />
        <br />
        Approve the Optimistic Governor at<br />
        {{ executionData.module.address }}<br />
        to take the bond from your account.<br />
        <BaseButton class="mt-3" @click="approveBond">
          approve bond
        </BaseButton>
      </div>
    </template>

    <template #dispute>
      <div class="mb-3">
        Proposed at: {{ new Date(proposedAt).toLocaleString() }}<br />
        Dispute timeout:
        {{ Math.max(proposedAt + disputeTimeout - now, 0).toFixed(0) }}s
      </div>
      <BaseButton @click="dispute"> Dispute transactions </BaseButton>
    </template>

    <template #execute>
      <div class="mb-3">Execution approved.</div>
      <BaseButton @click="execute"> Execute transactions </BaseButton>
    </template>

    <template #executed>
      <div class="flex flex-col items-center justify-center">
        <span class="mb-3 rounded-full bg-green p-2 text-white">
          <i-ho-check />
        </span>
        <span>Transactions have been executed.</span>
        <BaseLink link="https://etherscan.io">
          Open transaction in explorer
        </BaseLink>
      </div>
    </template>

    <template #rejected>
      <div class="flex flex-col items-center justify-center">
        <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
          <i-ho-x />
        </span>
        <span>Transactions have been rejected.</span>
      </div>
    </template>
  </ExecutionAbstract>
</template>
