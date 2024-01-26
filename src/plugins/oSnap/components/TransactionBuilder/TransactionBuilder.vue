<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';
import { NFT, Network, Transaction as TTransaction, Token } from '../../types';
import { getSafeAppLink } from '../../utils';
import Transaction from './Transaction.vue';
import TenderlySimulation from './TenderlySimulation.vue';

const props = defineProps<{
  safeAddress: string;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  network: Network;
  transactions: TTransaction[];
  proposal?: Proposal;
  space: ExtendedSpace;
  results?: Results;
}>();

const emit = defineEmits<{
  addTransaction: [transaction: TTransaction];
  removeTransaction: [transactionIndex: number];
  updateTransaction: [transaction: TTransaction, transactionIndex: number];
}>();

const safeLink = computed(() =>
  getSafeAppLink(props.network, props.safeAddress)
);
</script>

<template>
  <p class="my-2">
    <strong>Safe app link</strong
    ><a
      :href="safeLink"
      class="ml-2 inline-flex font-normal text-skin-text"
      target="_blank"
    >
      {{ shorten(safeAddress) }}
      <i-ho-external-link class="ml-1" />
    </a>
  </p>
  <p class="my-2">
    <strong>Module address</strong
    ><span class="ml-2 inline-block break-all">{{
      shorten(moduleAddress)
    }}</span>
  </p>
  <p class="my-2">
    <strong>Number of transactions</strong
    ><span class="ml-2 inline-block">{{ transactions.length }}</span>
  </p>
  <div class="text-center">
    <Transaction
      v-for="(transaction, index) in transactions"
      :key="index"
      :transaction="transaction"
      :transaction-index="index"
      :safe-address="safeAddress"
      :module-address="moduleAddress"
      :tokens="tokens"
      :collectables="collectables"
      :network="props.network"
      @update-transaction="(...args) => emit('updateTransaction', ...args)"
      @remove-transaction="(...args) => emit('removeTransaction', ...args)"
    />
    <TenderlySimulation
      v-if="transactions.length"
      :transactions="transactions"
      :safe-address="safeAddress"
      :module-address="moduleAddress"
      :network="props.network"
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
