<script setup lang="ts">
import { cloneDeep } from 'lodash';
import {
  ContractInteractionTransaction,
  TransferNftTransaction,
  type NFT,
  type Network,
  type RawTransaction as TRawTransaction,
  type Transaction as TTransaction,
  type TransactionType as TTransactionType,
  type Token,
  type TransferFundsTransaction
} from '../../types';
import TransactionType from '../Input/TransactionType.vue';
import ContractInteraction from './ContractInteraction.vue';
import RawTransaction from './RawTransaction.vue';
import TransferFunds from './TransferFunds.vue';
import TransferNFT from './TransferNFT.vue';

const props = defineProps<{
  transaction: TTransaction;
  transactionIndex: number;
  safeAddress: string;
  moduleAddress: string;
  tokens: Token[];
  collectables: NFT[];
  network: Network;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: TTransaction, transactionIndex: number];
  removeTransaction: [transactionIndex: number];
}>();

const newTransaction = ref<TTransaction>(cloneDeep(props.transaction));

function updateTransactionType(transactionType: TTransactionType) {
  newTransaction.value = {
    type: transactionType,
    to: '',
    value: '0',
    data: '0x',
    formatted: ['', 0, '0', '0x']
  };
  emit('updateTransaction', newTransaction.value, props.transactionIndex);
}

function updateTransaction(transaction: TTransaction) {
  newTransaction.value = transaction;
  emit('updateTransaction', newTransaction.value, props.transactionIndex);
}

function setTransactionAsInvalid() {
  const tx: TTransaction = {
    ...newTransaction.value,
    isValid: false
  };
  emit('updateTransaction', tx, props.transactionIndex);
}
</script>

<template>
  <div class="mt-4 border-b pb-4 first:mt-0">
    <div class="flex items-center justify-between text-[#FF5353]">
      <h3 class="text-left text-base">
        Transaction {{ transactionIndex + 1 }}
      </h3>
      <button
        v-if="transactionIndex !== 0"
        @click="emit('removeTransaction', transactionIndex)"
      >
        Remove
      </button>
    </div>
    <TransactionType
      :selected-transaction-type="transaction.type"
      @update-transaction-type="updateTransactionType"
    />
    <ContractInteraction
      v-if="transaction.type === 'contractInteraction'"
      :transaction="newTransaction as ContractInteractionTransaction"
      :network="network"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <TransferFunds
      v-if="transaction.type === 'transferFunds'"
      :network="network"
      :tokens="tokens"
      :transaction="newTransaction as TransferFundsTransaction"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <TransferNFT
      v-if="transaction.type === 'transferNFT'"
      :network="network"
      :safe-address="safeAddress"
      :collectables="collectables"
      :transaction="newTransaction as TransferNftTransaction"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />

    <RawTransaction
      v-if="transaction.type === 'raw'"
      :transaction="newTransaction as TRawTransaction"
      :setTransactionAsInvalid="setTransactionAsInvalid"
      @update-transaction="updateTransaction"
    />
  </div>
</template>
