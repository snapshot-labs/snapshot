<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';
import { shorten } from '@/helpers/utils';
import { EIP3770_PREFIXES } from '../../constants';
import { NFT, Network, Transaction as TTransaction, Token } from '../../types';
import HandleOutcomeUma from './HandleOutcomeUma.vue';
import Transaction from './Transaction.vue';

const props = defineProps<{
  safeAddress: string;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  network: Network;
  transactions: TTransaction[];
  proposal: Proposal;
  space: ExtendedSpace;
  results?: Results;
  isReadOnly: boolean;
}>();

const emit = defineEmits<{
  addTransaction: [transaction: TTransaction];
  removeTransaction: [transactionIndex: number];
  updateTransaction: [transaction: TTransaction, transactionIndex: number];
}>();

const proposalResolved = computed(() => {
  const ts = Number((Date.now() / 1e3).toFixed());
  return ts > props.proposal.end;
});

const safeLink = computed(() => {
  const prefix = EIP3770_PREFIXES[props.network];
  return `https://gnosis-safe.io/app/${prefix}:${props.safeAddress}`;
});
</script>

<template>
  <div>
    <p>
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
    <p><strong>Number of transactions</strong><span class="inline-block ml-2">{{  transactions.length }}</span></p>
    <div class="text-center">
      <Transaction
        v-for="(transaction, index) in transactions"
        :key="index"
        :transaction="transaction"
        :transaction-index="index"
        :is-read-only="isReadOnly"
        :safe-address="safeAddress"
        :module-address="moduleAddress"
        :tokens="tokens"
        :collectables="collectables"
        :network="props.network"
        @update-transaction="(...args) => emit('updateTransaction', ...args)"
        @remove-transaction="(...args) => emit('removeTransaction', ...args)"
      />
    </div>

    <div v-if="!isReadOnly || proposalResolved">
      <BaseButton
        v-if="!isReadOnly"
        class="my-3"
        @click="
          emit('addTransaction', {
            type: 'raw',
            to: '',
            value: '0',
            data: '0x',
            formatted: ['', 0, '0', '0x']
          })
        "
      >
        Add Transaction +
      </BaseButton>

      <HandleOutcomeUma
        v-if="isReadOnly && !!results"
        :space="space"
        :proposal="proposal"
        :transactions="transactions"
        :results="results"
        :module-address="moduleAddress"
        :network="network"
      />
    </div>
  </div>
</template>
