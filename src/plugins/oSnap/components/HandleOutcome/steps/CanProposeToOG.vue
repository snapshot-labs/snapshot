<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
const { formatDuration } = useIntl();

const props = defineProps<{
  hasSufficientAllowance: boolean;
  hasSufficientBalance: boolean;
  isDisputed: boolean;
  minimumBond: BigNumber;
  userBalance: BigNumber;
  decimals: BigNumber;
  symbol: string;
  challengePeriod: number;
  quorum: number;
  scoresTotal: number;
}>();

const emit = defineEmits<{
  approveBond: [event: void];
  submitProposal: [event: void];
}>();

const hasReachedQuorum = computed(() => props.scoresTotal >= props.quorum);
</script>

<template>
  <div>
    <p>
      Make sure this proposal was approved by this Snapshot vote before
      asserting on-chain. If the Snapshot vote rejected the proposal, the
      on-chain proposal will be rejected as well and you will lose your bond.
    </p>
  </div>
  <div class="rounded-lg border p-3">
    <div>
      <strong class="pr-3">Required bond:</strong>
      <span class="float-right text-skin-link">
        {{ formatUnits(minimumBond, decimals) }} {{ symbol }}
      </span>
    </div>
    <div>
      <strong class="pr-3">Challenge period:</strong>
      <span class="float-right text-skin-link">
        {{ formatDuration(challengePeriod) }}
      </span>
    </div>
  </div>
  <div>
    <BaseMessage v-if="!hasReachedQuorum" level="warning-red">
      Quorum did not reach space requirement
    </BaseMessage>
    <BaseMessage v-if="!hasSufficientBalance" level="warning-red">
      Your balance is less than the required bond
    </BaseMessage>
  </div>
  <div v-if="!hasSufficientAllowance">
    <p>
      On-chain proposals require a bond from the proposer. This will approve
      tokens from your wallet to be posted as a bond. If you make an invalid
      proposal, it will be disputed and you will lose your bond. If the proposal
      is valid, your bond will be returned when the transactions are executed.
    </p>
    <BaseButton
      :disabled="!hasReachedQuorum || !hasSufficientBalance"
      @click="emit('approveBond')"
      class="mr-2 mt-4 w-full"
    >
      Approve bond
    </BaseButton>
  </div>

  <div v-else>
    <p v-if="isDisputed" class="mb-2">
      Warning: This proposal was disputed on-chain. Exercise caution when
      proposing, because your proposal may be disputed too.
    </p>
    <BaseButton
      @click="emit('submitProposal')"
      class="my-1 w-full"
      :disabled="!hasReachedQuorum || !hasSufficientBalance"
    >
      Make assertion on Oracle
    </BaseButton>
  </div>
</template>
