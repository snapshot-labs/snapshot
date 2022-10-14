<script setup lang="ts">
import { computed } from 'vue';
import { formatUnits } from '@ethersproject/units';
import { Proposal } from '@/helpers/interfaces';
import { ModuleExecutionData } from '@/helpers/safe';
import { useExecutorUma } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposal: Proposal;
}>();

const executor = await useExecutorUma(props.executionData, props.proposal);
const hasBondAllowance = computed<boolean>(() =>
  executor.bondAllowance.value.gte(executor.bondAmount)
);
</script>

<template>
  <ExecutionAbstract :executor="executor">
    <template #propose>
      <div v-if="hasBondAllowance" class="flex flex-col">
        <BaseButton @click="executor.propose">
          propose transactions
        </BaseButton>
        <small class="mt-2 opacity-50">
          You will deposit a bond of {{ executor.bondAmount }}.
        </small>
      </div>
      <div v-else>
        To propose transactions you need to deposit a bond of
        {{ formatUnits(executor.bondAmount, executor.bondDecimals) }}
        {{ executor.bondSymbol }}.<br />
        <br />
        Approve the Optimistic Governor at<br />
        {{ executionData.module.address }}<br />
        to take the bond from your account.<br />
        <BaseButton class="mt-3" @click="executor.approveBond">
          approve bond
        </BaseButton>
      </div>
    </template>

    <template #dispute>
      <!-- TODO: display txs/hashes as proposed on chain-->
      <BaseButton @click="executor.dispute"> Dispute transactions </BaseButton>
    </template>

    <template #execute>
      <BaseButton @click="executor.execute"> Execute transactions </BaseButton>
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
