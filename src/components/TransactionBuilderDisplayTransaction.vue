<script setup lang="ts">
import { computed } from 'vue';
import { Transaction } from '@/helpers/safe';
import {
  detectTransactionForm,
  TransactionForms
} from '@/helpers/transactionBuilder';

const props = defineProps<{
  transaction: Transaction;
  network: string;
  contractAbi?: string;
}>();

const transactionDisplayType = computed<TransactionForms>(() => {
  return detectTransactionForm(props.transaction);
});
</script>

<template>
  <div class="flex">
    <div class="mr-2 flex w-5 items-center justify-center">
      <i-ho-database v-if="transactionDisplayType === TransactionForms.FUNDS" />
      <i-ho-photograph v-if="transactionDisplayType === TransactionForms.NFT" />
      <i-s-smart-contract
        v-if="transactionDisplayType === TransactionForms.CONTRACT"
      />
    </div>
    <TransactionBuilderDisplayTransactionFunds
      v-if="transactionDisplayType === TransactionForms.FUNDS"
      :transaction="transaction"
      :network="network"
    />
    <TransactionBuilderDisplayTransactionNFT
      v-if="transactionDisplayType === TransactionForms.NFT"
      :transaction="transaction"
      :network="network"
    />
    <TransactionBuilderDisplayTransactionContract
      v-if="transactionDisplayType === TransactionForms.CONTRACT"
      :transaction="transaction"
      :network="network"
      :abi="contractAbi"
    />
  </div>
</template>
