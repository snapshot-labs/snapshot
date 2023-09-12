<script setup lang="ts">
import { getIpfsUrl } from '@/helpers/utils';

import {
  ExtendedSpace,
  Proposal,
  Results,
  TreasuryWallet
} from '@/helpers/interfaces';
import {
  OptimisticGovernorTransaction,
  TransactionsByTreasuryAddress
} from '../types';
import SafeTransactions from './SafeTransactions.vue';

const props = defineProps<{
  modelValue: TransactionsByTreasuryAddress;
  proposal: Proposal;
  space: ExtendedSpace;
  preview: boolean;
  results?: Results;
}>();

const emit = defineEmits<{
  'update:modelValue': [transactions: TransactionsByTreasuryAddress];
}>();

function makeTransactionsByTreasuryAddress(treasuries: TreasuryWallet[]) {
  const transactionsByTreasuryAddress: TransactionsByTreasuryAddress = {};
  treasuries.forEach(treasury => {
    transactionsByTreasuryAddress[treasury.address] = {
      treasury,
      transactions: []
    };
  });
  return transactionsByTreasuryAddress;
}

function makeFlatArrayOfTransactions(
  transactionsByTreasuryAddress: TransactionsByTreasuryAddress
) {
  const flatArrayOfTransactions: OptimisticGovernorTransaction[] = [];
  Object.values(transactionsByTreasuryAddress).forEach(treasury => {
    flatArrayOfTransactions.push(...treasury.transactions);
  });
  return flatArrayOfTransactions;
}

const transactionsByTreasuryAddress = ref(
  makeTransactionsByTreasuryAddress(props.space.treasuries)
);

const ipfs = getIpfsUrl(props.proposal.ipfs);

function updateTransactions() {
  if (props.preview) return;
  emit('update:modelValue', transactionsByTreasuryAddress.value);
}
</script>

<template>
  <div
    v-if="!preview"
    class="mb-4 rounded-none border-b border-t bg-skin-block-bg md:rounded-xl md:border"
  >
    <div
      class="block border-b px-4 pt-3"
      style="
        padding-bottom: 12px;
        display: flex;
        justify-content: space-between;
      "
    >
      <h4>
        {{ $t('safeSnap.transactions') }}
      </h4>
      <BaseLink v-if="ipfs" :link="ipfs"> View Details </BaseLink>
    </div>

    <div
      v-for="{ treasury, transactions } in Object.values(
        transactionsByTreasuryAddress
      )"
      :key="treasury.address"
      class="border-b last:border-b-0"
    >
      <SafeTransactions
        v-if="!preview"
        :preview="preview"
        :proposal="proposal"
        :space="space"
        :results="results"
        :model-value="transactionsByTreasuryAddress[treasury.address]"
        :treasury="treasury"
        @update:modelValue="updateTransactions()"
      />
    </div>
  </div>
</template>
