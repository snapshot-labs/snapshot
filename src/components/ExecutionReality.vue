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
  executionState,
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
  <ExecutionAbstract
    :loading="loading"
    :execution-state="executionState"
    :network="executionData.safe.network"
  >
    <template #propose>
      <BaseButton class="w-full" primary @click="propose">
        Propose transactions for execution
      </BaseButton>
    </template>

    <template #dispute>
      <div>
        <div class="mb-2">Shall these transactions be executed?</div>
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
          <BaseButton @click="approveBond()">
            Approve {{ formatUnits(bondNextAmount, bondDecimals) }} as bond
          </BaseButton>
        </div>
        <div v-else class="space-x-3">
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
        </div>
        <div class="mt-2">
          Required bond: {{ formatUnits(bondNextAmount, bondDecimals) }}
          {{ bondSymbol }}
        </div>
        <div v-if="hasBondToken" class="mt-2">
          Allowance: {{ currentUserBondAllowance }} {{ bondSymbol }}
        </div>
      </div>
    </template>

    <template #execute>
      <div v-if="now < oracleAnswerFinalizedAt + cooldownPeriod">
        Execution approved. Waiting for cooldown:
        {{
          Math.max(oracleAnswerFinalizedAt + cooldownPeriod - now, 0).toFixed(
            0
          )
        }}s
      </div>
      <div v-else-if="now > oracleAnswerFinalizedAt + expirationPeriod">
        Execution approved but expired.
      </div>
      <div v-else>
        <BaseButton primary @click="execute">
          Execute transaction group #{{ nextTransactionToExecute + 1 }}
        </BaseButton>
        <div class="mt-1 opacity-50">
          Execution expires in:
          {{
            Math.max(
              oracleAnswerFinalizedAt + expirationPeriod - now,
              0
            ).toFixed(0)
          }}s
        </div>
      </div>
      <ExecutionRealityClaimBond
        class="mt-3 flex flex-col space-y-2"
        :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
        :withdraw-bond-balance="withdrawBondBalance"
        :withdrawable-user-bond-balance="withdrawableUserBondBalance"
        :bond-symbol="bondSymbol"
        :bond-decimals="bondDecimals"
        :all-bonds-assigned="allBondsAssigned"
        :current-user-voted-for-correct-answer="
          currentUserVotedForCorrectAnswer
        "
      />
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
      <ExecutionRealityClaimBond
        class="mt-3 flex flex-col space-y-2"
        :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
        :withdraw-bond-balance="withdrawBondBalance"
        :withdrawable-user-bond-balance="withdrawableUserBondBalance"
        :bond-symbol="bondSymbol"
        :bond-decimals="bondDecimals"
        :all-bonds-assigned="allBondsAssigned"
        :current-user-voted-for-correct-answer="
          currentUserVotedForCorrectAnswer
        "
      />
    </template>

    <template #rejected>
      <div class="flex flex-col items-center justify-center">
        <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
          <i-ho-x />
        </span>
        <span>Transactions have been rejected.</span>
      </div>
      <ExecutionRealityClaimBond
        class="mt-3 flex flex-col space-y-2"
        :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
        :withdraw-bond-balance="withdrawBondBalance"
        :withdrawable-user-bond-balance="withdrawableUserBondBalance"
        :bond-symbol="bondSymbol"
        :bond-decimals="bondDecimals"
        :all-bonds-assigned="allBondsAssigned"
        :current-user-voted-for-correct-answer="
          currentUserVotedForCorrectAnswer
        "
      />
    </template>

    <template #invalidated>
      <div class="flex flex-col items-center justify-center">
        <span class="mb-3 rounded-full bg-gray-300 p-2 text-white">
          <i-ho-x />
        </span>
        <span>The proposal has been marked as invalid.</span>
      </div>
      <ExecutionRealityClaimBond
        class="mt-3 flex flex-col space-y-2"
        :assign-bond-balances-and-withdraw="assignBondBalancesAndWithdraw"
        :withdraw-bond-balance="withdrawBondBalance"
        :withdrawable-user-bond-balance="withdrawableUserBondBalance"
        :bond-symbol="bondSymbol"
        :bond-decimals="bondDecimals"
        :all-bonds-assigned="allBondsAssigned"
        :current-user-voted-for-correct-answer="
          currentUserVotedForCorrectAnswer
        "
      />
    </template>
  </ExecutionAbstract>
</template>
