<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { ModuleExecutionData } from '@/helpers/safe';
import { useExecutorReality } from '@/composables';
import { formatUnits } from '@ethersproject/units';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposal: Proposal;
}>();

const {
  loading,
  RealityExecutionState,
  state,
  propose,
  dispute,
  execute,
  now,
  oracleContract,
  oracleAnswer,
  oracleAnswerFinalizedAt,
  cooldownPeriod,
  expirationPeriod,
  bondNextAmount,
  currentUserBondAllowance,
  withdrawableUserBondBalance,
  nextTransactionToExecute,
  hasBondToken,
  bondSymbol,
  bondDecimals,
  allBondsAssigned,
  currentUserVotedForCorrectAnswer,
  approveBond,
  assignBondBalancesAndWithdraw,
  withdrawBondBalance
} = await useExecutorReality(props.executionData, props.proposal);
</script>

<template>
  <LoadingSpinner v-if="loading" />

  <template v-else-if="state === RealityExecutionState.PROPOSABLE">
    <ExecutionEnsureNetwork :network="executionData.safe.network">
      <BaseButton primary @click="propose">
        Submit transactions for execution
      </BaseButton>
    </ExecutionEnsureNetwork>
  </template>

  <template v-else-if="state === RealityExecutionState.DISPUTABLE">
    <div>
      <div class="mb-2">Execute these transactions?</div>
      <div v-if="oracleAnswerFinalizedAt" class="mb-3">
        Current answer: {{ oracleAnswer ? 'Yes' : 'No' }}
        <div class="opacity-50">
          Dispute timeout:
          {{ Math.max(oracleAnswerFinalizedAt - now, 0).toFixed(0) }}
        </div>
      </div>

      <div v-if="hasBondToken && currentUserBondAllowance.lt(bondNextAmount)">
        Approve the Reality oracle at<br />
        {{ oracleContract.address }}<br />
        to take the bond from your account.<br />
        <ExecutionEnsureNetwork :network="executionData.safe.network">
          <BaseButton @click="approveBond()">
            Approve {{ formatUnits(bondNextAmount, bondDecimals) }} as bond
          </BaseButton>
        </ExecutionEnsureNetwork>
      </div>
      <div v-else class="space-x-3">
        <ExecutionEnsureNetwork :network="executionData.safe.network">
          <BaseButton
            v-if="!oracleAnswer || oracleAnswerFinalizedAt === 0"
            @click="dispute(true)"
          >
            Yes
          </BaseButton>
          <BaseButton
            v-if="oracleAnswer || oracleAnswerFinalizedAt === 0"
            @click="dispute(false)"
          >
            No
          </BaseButton>
        </ExecutionEnsureNetwork>
      </div>
      <small class="mt-2 block opacity-50">
        You will deposit a bond of
        {{ formatUnits(bondNextAmount, bondDecimals) }}
        {{ bondSymbol }}.
      </small>
      <div v-if="hasBondToken" class="mt-2">
        Allowance: {{ currentUserBondAllowance }} {{ bondSymbol }}
      </div>
    </div>
  </template>

  <template v-else-if="state === RealityExecutionState.EXECUTABLE">
    <div v-if="now < oracleAnswerFinalizedAt + cooldownPeriod">
      Execution approved. Waiting for cooldown:
      {{
        Math.max(oracleAnswerFinalizedAt + cooldownPeriod - now, 0).toFixed(0)
      }}s
    </div>
    <div
      v-else-if="now > oracleAnswerFinalizedAt + expirationPeriod"
      class="flex flex-col items-center justify-center"
    >
      <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
        <i-ho-x />
      </span>
      <span>Execution approved but expired.</span>
    </div>
    <div v-else>
      <ExecutionEnsureNetwork :network="executionData.safe.network">
        <BaseButton primary @click="execute">
          <template
            v-if="
              executionData.batches.length > 1 &&
              nextTransactionToExecute !== null
            "
          >
            Execute transaction group #{{ nextTransactionToExecute + 1 }}
          </template>
          <template v-else> Execute transactions </template>
        </BaseButton>
      </ExecutionEnsureNetwork>
      <small class="mt-1 block opacity-50">
        Expires in:
        {{
          Math.max(oracleAnswerFinalizedAt + expirationPeriod - now, 0).toFixed(
            0
          )
        }}s
      </small>
    </div>
    <ExecutionRealityClaimBond
      class="mt-3"
      :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
      :withdraw-bond-balance="withdrawBondBalance"
      :withdrawable-user-bond-balance="withdrawableUserBondBalance"
      :bond-symbol="bondSymbol"
      :bond-decimals="bondDecimals"
      :all-bonds-assigned="allBondsAssigned"
      :current-user-voted-for-correct-answer="currentUserVotedForCorrectAnswer"
    />
  </template>

  <template v-else-if="state === RealityExecutionState.EXECUTED">
    <div class="flex flex-col items-center justify-center">
      <span class="mb-3 rounded-full bg-green p-2 text-white">
        <i-ho-check />
      </span>
      <span>Transactions have been executed.</span>
      <BaseLink link="https://etherscan.io">
        Open transaction in explorer
      </BaseLink>
    </div>
    <ExecutionRealityClaimBond
      class="mt-3"
      :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
      :withdraw-bond-balance="withdrawBondBalance"
      :withdrawable-user-bond-balance="withdrawableUserBondBalance"
      :bond-symbol="bondSymbol"
      :bond-decimals="bondDecimals"
      :all-bonds-assigned="allBondsAssigned"
      :current-user-voted-for-correct-answer="currentUserVotedForCorrectAnswer"
    />
  </template>

  <template v-else-if="state === RealityExecutionState.REJECTED">
    <div class="flex flex-col items-center justify-center">
      <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
        <i-ho-x />
      </span>
      <span>Transactions have been rejected.</span>
    </div>
    <ExecutionRealityClaimBond
      class="mt-3"
      :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
      :withdraw-bond-balance="withdrawBondBalance"
      :withdrawable-user-bond-balance="withdrawableUserBondBalance"
      :bond-symbol="bondSymbol"
      :bond-decimals="bondDecimals"
      :all-bonds-assigned="allBondsAssigned"
      :current-user-voted-for-correct-answer="currentUserVotedForCorrectAnswer"
    />
  </template>

  <template v-else-if="state === RealityExecutionState.INVALIDATED">
    <div class="flex flex-col items-center justify-center">
      <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
        <i-ho-x />
      </span>
      <span>The proposal has been marked as invalid.</span>
    </div>
    <ExecutionRealityClaimBond
      class="mt-3"
      :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
      :withdraw-bond-balance="withdrawBondBalance"
      :withdrawable-user-bond-balance="withdrawableUserBondBalance"
      :bond-symbol="bondSymbol"
      :bond-decimals="bondDecimals"
      :all-bonds-assigned="allBondsAssigned"
      :current-user-voted-for-correct-answer="currentUserVotedForCorrectAnswer"
    />
  </template>
</template>
