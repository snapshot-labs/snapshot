<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import {
  GnosisSafe,
  NFT,
  SafeImportTransaction,
  Transaction as TTransaction,
  Token
} from '../../types';
import { getSafeAppLink } from '../../utils';
import Transaction from './Transaction.vue';
import TenderlySimulation from './TenderlySimulation.vue';
import TransactionImport from './TransactionImport.vue';

const props = defineProps<{
  tokens: Token[];
  collectibles: NFT[];
  safe: GnosisSafe;
}>();

const emit = defineEmits<{
  addTransaction: [transaction: TTransaction];
  removeTransaction: [transactionIndex: number];
  updateTransaction: [transaction: TTransaction, transactionIndex: number];
}>();

const safeLink = computed(() =>
  getSafeAppLink(props.safe.network, props.safe.safeAddress)
);

function addImportedTransactions(transactions: SafeImportTransaction[]) {
  transactions.forEach(tx => emit('addTransaction', tx));
}
</script>

<template>
  <p class="my-2">
    <strong>Safe app link</strong
    ><a
      :href="safeLink"
      class="ml-2 inline-flex font-normal text-skin-text"
      target="_blank"
    >
      {{ shorten(safe.safeAddress) }}
      <i-ho-external-link class="ml-1" />
    </a>
  </p>
  <p class="my-2">
    <strong>Module address</strong
    ><span class="ml-2 inline-block break-all">{{
      shorten(safe.moduleAddress)
    }}</span>
  </p>
  <p class="my-2">
    <strong>Number of transactions</strong
    ><span class="ml-2 inline-block">{{ safe.transactions.length }}</span>
    <TransactionImport
      @update:imported-transactions="addImportedTransactions"
      :safe="props.safe"
      :network="safe.network"
    />
  </p>
  <div class="text-center">
    <Transaction
      v-for="(transaction, index) in safe.transactions"
      :key="index"
      :transaction="transaction"
      :transaction-index="index"
      :safe-address="safe.safeAddress"
      :module-address="safe.moduleAddress"
      :tokens="tokens"
      :collectables="collectibles"
      :network="safe.network"
      @update-transaction="(...args) => emit('updateTransaction', ...args)"
      @remove-transaction="(...args) => emit('removeTransaction', ...args)"
    />
    <TenderlySimulation
      v-if="safe.transactions.length"
      :transactions="safe.transactions"
      :safe="props.safe"
      :network="safe.network"
      class="mt-4"
    />
  </div>

  <TuneButton
    class="mt-4 w-full"
    @click="
      emit('addTransaction', {
        type: 'transferFunds',
        to: '',
        value: '0',
        data: '0x',
        formatted: ['', 0, '0', '0x']
      })
    "
  >
    Add transaction +
  </TuneButton>
</template>
