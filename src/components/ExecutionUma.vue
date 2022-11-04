<script setup lang="ts">
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
  propose,
  dispute,
  execute,
  settleRejected,
  approveBond,
  loading,
  oracleContract,
  bondInfo,
  proposedAt,
  disputeCountdown,
  isWaitingForOtherProposal,
  isProposed,
  isDisputed,
  isExecuted,
  isRejected,
  isExecutable,
  isRejectable
} = await useExecutorUma(
  props.executionDataIndex,
  props.executionData,
  props.proposal
);
</script>

<template>
  <LoadingSpinner v-if="loading" />

  <div v-else-if="isExecuted" class="flex flex-col items-center justify-center">
    <span class="mb-3 rounded-full bg-green p-2 text-white">
      <i-ho-check />
    </span>
    <span>Transactions have been executed.</span>
  </div>

  <div v-else-if="isRejected" class="flex flex-col items-center justify-center">
    <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
      <i-ho-x />
    </span>
    <span>Transactions have been rejected.</span>
  </div>

  <template v-else-if="isDisputed">
    Transactions have benn disputed. Waiting for dispute to be resolved.
  </template>

  <template v-else-if="isExecutable">
    <div class="mb-3">Transactions have benn approved.</div>
    <ExecutionEnsureNetwork :network="executionData.safe.network">
      <BaseButton @click="execute"> Execute transactions </BaseButton>
    </ExecutionEnsureNetwork>
  </template>

  <template v-else-if="isRejectable">
    Transactions have been rejected.
    <ExecutionEnsureNetwork :network="executionData.safe.network">
      <BaseButton @click="settleRejected">
        Settle rejection and return bonds
      </BaseButton>
    </ExecutionEnsureNetwork>
  </template>

  <template v-else-if="isProposed">
    <div class="mb-3">
      <div>
        Proposed at: {{ new Date(proposedAt.toNumber()).toLocaleString() }}
      </div>
      <div>Dispute timeout: {{ disputeCountdown }}s</div>
    </div>
    <template v-if="bondInfo.currentUserBalance.gte(bondInfo.requiredAmount)">
      <template
        v-if="bondInfo.currentUserOracleAllowance.gte(bondInfo.requiredAmount)"
      >
        <ExecutionEnsureNetwork :network="executionData.safe.network">
          <BaseButton @click="dispute"> Dispute transactions </BaseButton>
        </ExecutionEnsureNetwork>
      </template>
      <template v-else>
        To dispute a proposal you need to deposit a bond of
        {{ formatUnits(bondInfo.requiredAmount, bondInfo.decimals) }}
        {{ bondInfo.symbol }}.<br />
        <br />
        Approve the Optimistic Oracle at<br />
        {{ oracleContract.address }}<br />
        to take the bond from your account.
        <ExecutionEnsureNetwork :network="executionData.safe.network">
          <BaseButton
            class="mt-3"
            @click="
              approveBond(oracleContract.address, bondInfo.requiredAmount)
            "
          >
            approve bond
          </BaseButton>
        </ExecutionEnsureNetwork>
      </template>
    </template>
    <template v-else>
      You don't have the required
      {{ formatUnits(bondInfo.requiredAmount, bondInfo.decimals) }}
      {{ bondInfo.symbol }} to dispute these transactions.
    </template>
  </template>

  <template v-else-if="isWaitingForOtherProposal">
    These transactions are currently being proposed in another proposal. Settle
    these transactions first before continuing here.
  </template>

  <template v-else>
    <template v-if="bondInfo.currentUserBalance.gte(bondInfo.requiredAmount)">
      <template
        v-if="bondInfo.currentUserModuleAllowance.gte(bondInfo.requiredAmount)"
      >
        <div>Propose these transactions for execution.</div>
        <small class="opacity-50">
          You will deposit a bond of
          {{ formatUnits(bondInfo.requiredAmount, bondInfo.decimals) }}
          {{ bondInfo.symbol }}.
        </small>
        <ExecutionEnsureNetwork :network="executionData.safe.network">
          <BaseButton primary @click="propose">
            propose transactions
          </BaseButton>
        </ExecutionEnsureNetwork>
      </template>
      <template v-else>
        To propose transactions you need to deposit a bond of
        {{ formatUnits(bondInfo.requiredAmount, bondInfo.decimals) }}
        {{ bondInfo.symbol }}.<br />
        <br />
        Approve the Optimistic Governor at<br />
        {{ executionData.module.address }}<br />
        to take the bond from your account.
        <ExecutionEnsureNetwork :network="executionData.safe.network">
          <BaseButton
            class="mt-3"
            @click="
              approveBond(executionData.module.address, bondInfo.requiredAmount)
            "
          >
            approve bond
          </BaseButton>
        </ExecutionEnsureNetwork>
      </template>
    </template>
    <template v-else>
      You don't have the required
      {{ formatUnits(bondInfo.requiredAmount, bondInfo.decimals) }}
      {{ bondInfo.symbol }} to propose these transactions for execution.
    </template>
  </template>
</template>
