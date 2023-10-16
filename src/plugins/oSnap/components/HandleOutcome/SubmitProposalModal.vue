<script setup lang="ts">
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
const { formatDuration } = useIntl();

const props = defineProps<{
  isModalOpen: boolean;
  minimumBond: BigNumber;
  userBalance: BigNumber;
  decimals: BigNumber;
  symbol: string;
  livenessPeriod: number;
  quorum: number;
  scoresTotal: number;
}>();

const emit = defineEmits<{
  close: [event: void];
  submitProposal: [event: void];
}>();

const hasReachedQuorum = computed(() => props.scoresTotal >= props.quorum);
const hasSufficientBalance = computed(() =>
  props.userBalance.gte(props.minimumBond)
);
</script>

<template>
  <BaseModal :open="isModalOpen" @close="emit('close')">
    <template #header>
      <h3 class="title">Request execution</h3>
    </template>
    <div class="my-3 p-3">
      <div class="pl-3 pr-3">
        <p>
          Make sure this proposal was approved by this Snapshot vote before
          proposing on-chain. If the Snapshot vote rejected the proposal, the
          on-chain proposal will be rejected as well and you will lose your
          bond.
        </p>
      </div>
      <div class="my-3 rounded-lg border p-3">
        <div>
          <strong class="pr-3">Required bond:</strong>
          <span class="float-right text-skin-link">
            {{ formatUnits(minimumBond, decimals) }} {{ symbol }}
          </span>
        </div>
        <div>
          <strong class="pr-3">Challenge period:</strong>
          <span class="float-right text-skin-link">
            {{ formatDuration(livenessPeriod) }}
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

      <BaseButton
        @click="emit('submitProposal')"
        class="my-1 w-full"
        :disabled="!hasReachedQuorum || !hasSufficientBalance"
      >
        Request execution
      </BaseButton>
    </div>
  </BaseModal>
</template>
