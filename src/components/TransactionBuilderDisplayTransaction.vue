<script setup lang="ts">
import { computed } from 'vue';
import { shortenAddress } from '@/helpers/utils';
import {
  detectTransactionForm,
  Transaction,
  TransactionForms
} from '@/helpers/transactionBuilder';

const props = defineProps<{
  transaction: Transaction;
}>();

const transactionDisplayType = computed<TransactionForms>(() => {
  return detectTransactionForm(props.transaction);
});
</script>

<template>
  <div class="flex">
    <div class="mr-2 flex w-5 grow items-center justify-center">
      <i-ho-database v-if="transactionDisplayType === TransactionForms.FUNDS" />
      <i-ho-photograph v-if="transactionDisplayType === TransactionForms.NFT" />
      <i-s-smart-contract
        v-if="transactionDisplayType === TransactionForms.CONTRACT"
      />
    </div>
    <div>
      <div>To: {{ shortenAddress(transaction.to) }}</div>
      <div>Value: {{ transaction.value }}</div>
    </div>
  </div>
</template>
